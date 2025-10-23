// backend/server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

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
        messages: [{ role: "user", content: `Provide a concise overview of: ${query}` }],
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

// Links endpoint (placeholder; replace with your search/curation logic)
app.post("/api/search", async (req, res) => {
  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  // Example: static items to prove wiring works
  res.json({
    results: [
      { title: "Official wiki", description: `Background info for "${query}"` },
      { title: "YouTube guide", description: "Step-by-step walkthrough and tips" }
    ]
  });
});

// Server listen
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Backend running on port " + port));
