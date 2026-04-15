/**
 * BetIQ — Live Data Sync Server
 * ──────────────────────────────
 * Runs as a lightweight backend that:
 *  • Fetches today's real games + odds every 5 minutes
 *  • Fetches player stats every 60 minutes
 *  • Detects line movement and triggers alerts
 *  • Serves data to the React frontend via a simple REST API
 *  • Resets at midnight for a fresh day
 *
 * SETUP:
 *   npm install express cors node-cron axios dotenv
 *   node server.js
 *
 * FRONTEND connects to:
 *   GET /api/games        → today's live games + odds
 *   GET /api/players/:sport → live player stats
 *   GET /api/status       → server health + last update time
 */

require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const cron     = require("node-cron");
const axios    = require("axios");

const app  = express();
app.use(cors());
app.use(express.json());

// ── CONFIG ────────────────────────────────────────────────────
const CONFIG = {
  ODDS_API_KEY:  process.env.ODDS_API_KEY,
  RAPIDAPI_KEY:  process.env.RAPIDAPI_KEY,
  ODDS_BASE:     "https://api.the-odds-api.com/v4",
  TANK_BASE:     "https://tank01-fantasy-stats.p.rapidapi.com",
  BOOKMAKER:     process.env.BOOKMAKER || "draftkings",
  PORT:          process.env.PORT || 3001,

  // How often to refresh (milliseconds)
  ODDS_INTERVAL_MS:    5  * 60 * 1000,  // every 5 minutes
  PLAYERS_INTERVAL_MS: 60 * 60 * 1000,  // every 60 minutes
};

const SPORT_KEYS = {
  NBA: "basketball_nba",
  NFL: "americanfootball_nfl",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
};

const SPORT_EMOJIS = { NBA:"🏀", NFL:"🏈", MLB:"⚾", NHL:"🏒" };

// ── IN-MEMORY STORE ───────────────────────────────────────────
// This is what the frontend reads. Updated automatically.
let store = {
  games:       [],          // all live games today
  players:     { nba:[], nfl:[], mlb:[], nhl:[] },
  lastOddsUpdate:    null,
  lastPlayersUpdate: null,
  oddsApiRemaining:  "?",
  lineMovements:     [],    // recent line moves detected
  status:            "starting",
};

// Track previous odds to detect line movement
let previousOdds = {};

// ── ODDS FETCHER ──────────────────────────────────────────────

async function fetchOddsForSport(sport) {
  const key = SPORT_KEYS[sport];
  if (!key) return [];

  try {
    const res = await axios.get(`${CONFIG.ODDS_BASE}/sports/${key}/odds/`, {
      params: {
        apiKey:     CONFIG.ODDS_API_KEY,
        regions:    "us",
        markets:    "h2h,totals,spreads",
        oddsFormat: "american",
        bookmakers: CONFIG.BOOKMAKER,
      }
    });

    // Track remaining quota
    store.oddsApiRemaining = res.headers["x-requests-remaining"] || "?";

    return res.data.map(game => {
      const book     = game.bookmakers?.[0];
      const h2h      = book?.markets?.find(m => m.key === "h2h");
      const totals   = book?.markets?.find(m => m.key === "totals");
      const spreads  = book?.markets?.find(m => m.key === "spreads");

      const homeH2H    = h2h?.outcomes?.find(o => o.name === game.home_team);
      const awayH2H    = h2h?.outcomes?.find(o => o.name === game.away_team);
      const homeSpread = spreads?.outcomes?.find(o => o.name === game.home_team);
      const totalLine  = totals?.outcomes?.[0]?.point;

      const gameTime = new Date(game.commence_time).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: "America/New_York"
      });

      const gameObj = {
        id:          game.id,
        sport,
        e:           SPORT_EMOJIS[sport],
        home:        game.home_team,
        away:        game.away_team,
        time:        gameTime,
        commenceTime: game.commence_time,
        hO:          homeH2H?.price    || 0,
        aO:          awayH2H?.price    || 0,
        spread:      homeSpread?.point || 0,
        total:       totalLine         || 0,
        bookmaker:   CONFIG.BOOKMAKER,
        updatedAt:   new Date().toISOString(),
      };

      // ── Detect line movement ──
      const prev = previousOdds[game.id];
      if (prev) {
        const homeDiff = Math.abs(gameObj.hO - prev.hO);
        const awayDiff = Math.abs(gameObj.aO - prev.aO);
        if (Math.max(homeDiff, awayDiff) >= 8) {
          const movement = {
            gameId:    game.id,
            sport,
            matchup:   `${game.away_team} @ ${game.home_team}`,
            homeDiff,
            awayDiff,
            direction: homeDiff > awayDiff
              ? (gameObj.hO < prev.hO ? "🔥 Sharp money on " + game.home_team : "📉 " + game.home_team + " fading")
              : (gameObj.aO < prev.aO ? "🔥 Sharp money on " + game.away_team : "📉 " + game.away_team + " fading"),
            detectedAt: new Date().toISOString(),
          };
          store.lineMovements = [movement, ...store.lineMovements].slice(0, 20); // keep last 20
          console.log(`📈 LINE MOVE: ${movement.matchup} — ${movement.direction}`);
        }
      }
      previousOdds[game.id] = { hO: gameObj.hO, aO: gameObj.aO };

      return gameObj;
    }).filter(g => g.hO !== 0);

  } catch (err) {
    console.error(`❌ Odds fetch failed for ${sport}:`, err.message);
    return [];
  }
}

async function refreshAllOdds() {
  console.log(`\n⚡ [${new Date().toLocaleTimeString()}] Refreshing live odds...`);
  try {
    const [nba, nfl, mlb, nhl] = await Promise.all([
      fetchOddsForSport("NBA"),
      fetchOddsForSport("NFL"),
      fetchOddsForSport("MLB"),
      fetchOddsForSport("NHL"),
    ]);
    store.games           = [...nba, ...nfl, ...mlb, ...nhl];
    store.lastOddsUpdate  = new Date().toISOString();
    store.status          = "live";
    console.log(`✅ ${store.games.length} games loaded · API credits remaining: ${store.oddsApiRemaining}`);
  } catch (err) {
    console.error("❌ Odds refresh failed:", err.message);
  }
}

// ── PLAYER STATS FETCHER ──────────────────────────────────────

const TANK_HEADERS = {
  "x-rapidapi-key":  CONFIG.RAPIDAPI_KEY,
  "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
};

function getForm(value) {
  if (value >= 25) return "hot";
  if (value >= 15) return "warm";
  return "cold";
}

function propLine(avg, stat) {
  if (!avg || avg === 0) return "N/A";
  return `O${(avg * 0.95).toFixed(1)} ${stat}`;
}

async function fetchNBAPlayers() {
  try {
    const res = await axios.get(`${CONFIG.TANK_BASE}/getNBAPlayerList`, { headers: TANK_HEADERS });
    return (res.data.body || [])
      .filter(p => p.stats?.pts)
      .sort((a,b) => parseFloat(b.stats.pts) - parseFloat(a.stats.pts))
      .slice(0, 30)
      .map(p => ({
        name: p.longName,
        team: p.team,
        s1:   parseFloat(p.stats.pts  || 0).toFixed(1),
        s2:   parseFloat(p.stats.reb  || 0).toFixed(1),
        s3:   parseFloat(p.stats.ast  || 0).toFixed(1),
        form: getForm(parseFloat(p.stats.pts || 0)),
        pick: propLine(parseFloat(p.stats.pts || 0), "PTS"),
        injury: p.injury?.designation || null,
      }));
  } catch (err) { console.error("NBA players:", err.message); return []; }
}

async function fetchNFLPlayers() {
  try {
    const res = await axios.get(`${CONFIG.TANK_BASE}/getNFLPlayerList`, { headers: TANK_HEADERS });
    return (res.data.body || [])
      .filter(p => p.stats?.passYds || p.stats?.rushYds || p.stats?.recYds)
      .slice(0, 30)
      .map(p => {
        const isQB  = p.pos === "QB";
        const isRB  = p.pos === "RB";
        const isWR  = ["WR","TE"].includes(p.pos);
        const yds   = isQB ? p.stats?.passYds : isRB ? p.stats?.rushYds : p.stats?.recYds;
        const td    = isQB ? p.stats?.passTD  : isRB ? p.stats?.rushTD  : p.stats?.recTD;
        return {
          name: p.longName,
          team: p.team,
          s1:   `${yds||0} YDS`,
          s2:   `${td||0} TD`,
          s3:   isQB ? `${p.stats?.int||0} INT` : `${p.stats?.carries||p.stats?.targets||0} ATT`,
          form: getForm(parseFloat(p.stats?.fantasyPoints || 0)),
          pick: propLine(parseFloat(yds||0)/17, "YDS"),
          injury: p.injury?.designation || null,
        };
      });
  } catch (err) { console.error("NFL players:", err.message); return []; }
}

async function fetchMLBPlayers() {
  try {
    const res = await axios.get(`${CONFIG.TANK_BASE}/getMLBPlayerList`, { headers: TANK_HEADERS });
    return (res.data.body || [])
      .filter(p => p.stats?.batting?.homeRuns)
      .sort((a,b) => parseInt(b.stats.batting.homeRuns) - parseInt(a.stats.batting.homeRuns))
      .slice(0, 30)
      .map(p => ({
        name: p.longName,
        team: p.team,
        s1:   p.stats?.batting?.avg    || ".000",
        s2:   `${p.stats?.batting?.homeRuns||0} HR`,
        s3:   `${p.stats?.batting?.rbi||0} RBI`,
        form: getForm(parseFloat((p.stats?.batting?.avg||".000").replace(".",""))/10),
        pick: `O${((parseFloat(p.stats?.batting?.homeRuns||0)/162)*2).toFixed(1)} TB`,
        injury: p.injury?.designation || null,
      }));
  } catch (err) { console.error("MLB players:", err.message); return []; }
}

async function fetchNHLPlayers() {
  try {
    const res = await axios.get(`${CONFIG.TANK_BASE}/getNHLPlayerList`, { headers: TANK_HEADERS });
    return (res.data.body || [])
      .filter(p => p.stats?.points)
      .sort((a,b) => parseInt(b.stats.points) - parseInt(a.stats.points))
      .slice(0, 30)
      .map(p => ({
        name: p.longName,
        team: p.team,
        s1:   `${p.stats?.goals  ||0} G`,
        s2:   `${p.stats?.assists||0} A`,
        s3:   `${p.stats?.points ||0} PTS`,
        form: getForm(parseFloat(p.stats?.points||0)/8),
        pick: propLine(parseFloat(p.stats?.points||0)/82, "PTS"),
        injury: p.injury?.designation || null,
      }));
  } catch (err) { console.error("NHL players:", err.message); return []; }
}

async function refreshAllPlayers() {
  console.log(`\n👤 [${new Date().toLocaleTimeString()}] Refreshing player stats...`);
  try {
    const [nba, nfl, mlb, nhl] = await Promise.all([
      fetchNBAPlayers(), fetchNFLPlayers(), fetchMLBPlayers(), fetchNHLPlayers()
    ]);
    store.players            = { nba, nfl, mlb, nhl };
    store.lastPlayersUpdate  = new Date().toISOString();
    console.log(`✅ Players loaded: NBA(${nba.length}) NFL(${nfl.length}) MLB(${mlb.length}) NHL(${nhl.length})`);
  } catch (err) {
    console.error("❌ Players refresh failed:", err.message);
  }
}

// ── MIDNIGHT RESET ─────────────────────────────────────────────
// Clear old games and line movements every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("\n🔄 Midnight reset — clearing stale data");
  store.games        = [];
  store.lineMovements = [];
  previousOdds       = {};
  // Immediately fetch fresh data for the new day
  refreshAllOdds();
  refreshAllPlayers();
});

// ── SCHEDULED REFRESHES ────────────────────────────────────────
// Odds: every 5 minutes between 9am and midnight
cron.schedule("*/5 9-23 * * *", refreshAllOdds);

// Players: every 60 minutes
cron.schedule("0 * * * *", refreshAllPlayers);

// ── REST API ROUTES ────────────────────────────────────────────

// All live games today
app.get("/api/games", (req, res) => {
  const { sport } = req.query;
  const games = sport
    ? store.games.filter(g => g.sport === sport.toUpperCase())
    : store.games;
  res.json({
    games,
    count:       games.length,
    lastUpdated: store.lastOddsUpdate,
    nextUpdate:  "Every 5 minutes",
  });
});

// Player stats by sport
app.get("/api/players/:sport", (req, res) => {
  const sport   = req.params.sport.toLowerCase();
  const players = store.players[sport] || [];
  res.json({
    players,
    count:       players.length,
    lastUpdated: store.lastPlayersUpdate,
    nextUpdate:  "Every 60 minutes",
  });
});

// Recent line movements (Sharp money tracker)
app.get("/api/line-movements", (req, res) => {
  res.json({
    movements:   store.lineMovements,
    count:       store.lineMovements.length,
  });
});

// AI picks endpoint — proxies Anthropic API to avoid CORS
app.post("/api/ai-pick", async (req, res) => {
  const { prompt } = req.body;
  try {
    const r = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      }
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server health + status
app.get("/api/status", (req, res) => {
  res.json({
    status:            store.status,
    gamesLoaded:       store.games.length,
    lastOddsUpdate:    store.lastOddsUpdate,
    lastPlayersUpdate: store.lastPlayersUpdate,
    oddsApiRemaining:  store.oddsApiRemaining,
    lineMovements:     store.lineMovements.length,
    uptime:            process.uptime(),
  });
});

// ── START ──────────────────────────────────────────────────────
async function start() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚡  BetIQ Live Data Sync Server");
  console.log(`🌐  http://localhost:${CONFIG.PORT}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Initial data load on startup
  await Promise.all([refreshAllOdds(), refreshAllPlayers()]);

  app.listen(CONFIG.PORT, () => {
    console.log(`\n🚀 Server running on port ${CONFIG.PORT}`);
    console.log(`📡 Odds refresh: every 5 min (9am–midnight)`);
    console.log(`👤 Players refresh: every 60 min`);
    console.log(`🔄 Midnight reset: daily at 12:00 AM\n`);
  });
}

start();
