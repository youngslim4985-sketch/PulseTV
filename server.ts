import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Mock data categories
const contentData = {
  movies: [
    { id: "m1", title: "Interstellar", thumb: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=225&fit=crop", duration: 120, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { id: "m2", title: "The Martian", thumb: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=225&fit=crop", duration: 144, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    { id: "m3", title: "Gravity", thumb: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop", duration: 90, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
    { id: "m4", title: "Arrival", thumb: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&h=225&fit=crop", duration: 116, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  ],
  sports: [
    { id: "s1", title: "F1: Monaco GP", thumb: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=400&h=225&fit=crop", isLive: true, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
    { id: "s2", title: "Wimbledon Finals", thumb: "https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?w=400&h=225&fit=crop", isLive: true, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  ],
  basketball: {
    "EuroLeague": [
      { id: "b1", title: "Real Madrid vs Fenerbahçe", thumb: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=225&fit=crop", isLive: true, league: "EuroLeague", region: "Europe", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
      { id: "b2", title: "Panathinaikos vs Olympiacos", thumb: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=225&fit=crop", isLive: false, league: "EuroLeague", region: "Europe", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
    ],
    "NBA": [
      { id: "b3", title: "Lakers vs Celtics", thumb: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=225&fit=crop", isLive: true, league: "NBA", region: "USA", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: "b4", title: "Warriors vs Suns", thumb: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=225&fit=crop", isLive: false, league: "NBA", region: "USA", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    ],
    "NCAA": [
      { id: "b5", title: "Duke vs UNC", thumb: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=225&fit=crop", isLive: true, league: "NCAA", region: "USA", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
    ]
  },
  soccer: {
    "World Cup": [
      { id: "wc1", title: "Brazil vs France", thumb: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=225&fit=crop", isLive: true, league: "World Cup", region: "International", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: "wc2", title: "Argentina vs Germany", thumb: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=225&fit=crop", isLive: false, league: "World Cup", region: "International", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    ],
    "Champions League": [
      { id: "cl1", title: "Real Madrid vs Man City", thumb: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=225&fit=crop", isLive: true, league: "Champions League", region: "Europe", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
    ],
    "Premier League": [
      { id: "pl1", title: "Arsenal vs Liverpool", thumb: "https://images.unsplash.com/photo-1518091043644-c1d445bcc97a?w=400&h=225&fit=crop", isLive: false, league: "Premier League", region: "UK", url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
    ]
  },
  live_tv: [
    { id: "l1", title: "BBC News", thumb: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=225&fit=crop", isLive: true, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
    { id: "l2", title: "National Geographic", thumb: "https://images.unsplash.com/photo-1433086466340-7f3bd3ed30c3?w=400&h=225&fit=crop", isLive: true, url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
  ]
};

async function startServer() {
  app.use(express.json());

  // API Endpoints
  app.get("/api/content", (req, res) => {
    res.json(contentData);
  });

  app.get("/api/search", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const bbItems = Object.values(contentData.basketball).flat();
    const soccerItems = Object.values(contentData.soccer).flat();
    const all = [...contentData.movies, ...contentData.sports, ...contentData.live_tv, ...bbItems, ...soccerItems];
    const results = all.filter(item => item.title.toLowerCase().includes(query));
    res.json(results);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "up", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
