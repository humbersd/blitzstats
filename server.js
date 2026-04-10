require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const PORT = process.env.PORT || 3001;

const SPORT_KEYS = {
  NBA: "basketball_nba",
  NFL: "americanfootball_nfl",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
};

let store = {
  games: [],
  lastUpdate: null,
  status: "starting",
};

async function fetchGames() {
  console.log(`\n⚡ [${new Date().toLocaleTimeString()}] Fetching live odds...`);
  let allGames = [];
  for (const [sport, key] of Object.entries(SPORT_KEYS)) {
    try {
      const res = await axios.get(`https://api.the-odds-api.com/v4/sports/${key}/odds/`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: "us",
          markets: "h2h,totals",
          oddsFormat: "american",
          bookmakers: "draftkings",
        },
      });
      const games = res.data.map((g) => {
        const book = g.bookmakers?.[0];
        const h2h = book?.markets?.find((m) => m.key === "h2h");
        const totals = book?.markets?.find((m) => m.key === "totals");
        const homeO = h2h?.outcomes?.find((o) => o.name === g.home_team);
        const awayO = h2h?.outcomes?.find((o) => o.name === g.away_team);
        const total = totals?.outcomes?.[0]?.point;
        const time = new Date(g.commence_time).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
        }) + " ET";
        return {
          id: g.id, sport,
          e: { NBA:"🏀", NFL:"🏈", MLB:"⚾", NHL:"🏒" }[sport],
          home: g.home_team, away: g.away_team,
          time, hO: homeO?.price || 0, aO: awayO?.price || 0,
          total: total || 0,
        };
      }).filter((g) => g.hO !== 0);
      allGames = [...allGames, ...games];
      console.log(`✅ ${sport}: ${games.length} games`);
    } catch (err) {
      console.error(`❌ ${sport} failed:`, err.message);
    }
  }
  store.games = allGames;
  store.lastUpdate = new Date().toISOString();
  store.status = "live";
  console.log(`\n🎯 Total: ${allGames.length} live games loaded`);
}

app.get("/api/games", (req, res) => {
  const { sport } = req.query;
  const games = sport ? store.games.filter((g) => g.sport === sport) : store.games;
  res.json({ games, count: games.length, lastUpdated: store.lastUpdate });
});

app.get("/api/status", (req, res) => {
  res.json({ status: store.status, games: store.games.length, lastUpdate: store.lastUpdate });
});

cron.schedule("*/5 * * * *", fetchGames);

app.listen(PORT, async () => {
  console.log(`\n🚀 BlitzStats server running on port ${PORT}`);
  await fetchGames();
});
