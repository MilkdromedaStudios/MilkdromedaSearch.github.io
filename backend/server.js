import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Allow fonts/styles (CSP fix)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' https: 'unsafe-inline'; img-src 'self' data: https:;");
  next();
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Overview endpoint
app.post("/api/overview", async (req, res) => {
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Give a concise overview of: ${query}` }],
        temperature: 0.5
      })
    });

    const data = await aiRes.json().catch(() => null);
    const content = data?.choices?.[0]?.message?.content?.trim();
    res.json({ result: content || "No overview available." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Links endpoint (placeholder)
app.post("/api/search", async (req, res) => {
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  res.json({
    results: [
      { title: "Official wiki", description: `Background info for "${query}"` },
      { title: "YouTube guide", description: "Step-by-step walkthrough and tips" }
    ]
  });
});

// Root route
app.get("/", (_req, res) => {
  res.send("Backend is running. Use /api/overview or /api/search.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Backend running on port " + port));
