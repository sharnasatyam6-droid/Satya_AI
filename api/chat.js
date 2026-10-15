const SYSTEM_PROMPT = `You are Satya AI, a helpful, friendly, thoughtful AI assistant created as a personal project. Be clear, practical, and encouraging. Explain difficult ideas in accessible language, help with programming and learning, and admit uncertainty instead of inventing facts. For cybersecurity questions, support authorized, ethical learning and defensive work only. Never claim to have performed actions you have not performed. Do not ask users to share passwords, API keys, or other secrets.`;

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to send a message." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Satya AI is deployed, but its AI provider is not configured yet. The owner needs to add OPENAI_API_KEY in Vercel Project Settings → Environment Variables, then redeploy."
    });
  }

  try {
    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return res.status(400).json({ error: "Please enter a message." });
    if (message.length > 8000) return res.status(413).json({ error: "Message is too long. Please keep it under 8,000 characters." });

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history = rawHistory.slice(-20).filter(item =>
      item && ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string" && item.content.length <= 8000
    ).map(item => ({ role: item.role, content: item.content }));

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider returned status", upstream.status);
      if (upstream.status === 401) return res.status(502).json({ error: "The AI provider rejected the configured key. The site owner should check the Vercel environment variable." });
      if (upstream.status === 429) return res.status(429).json({ error: "The AI provider rate limit or usage quota was reached. Please try later." });
      return res.status(502).json({ error: "The AI provider could not complete the request. Please try again later." });
    }

    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "The AI provider returned an empty response. Please try again." });
    }
    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error("Satya AI request failed:", error && error.message ? error.message : "unknown error");
    return res.status(500).json({ error: "Something went wrong while generating a reply. Please try again." });
  }
};