export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const es = req.body?.es;
  if (!es) return res.status(400).json({ error: "Missing input" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role: "user", content: `You are a Spanish language expert. Given the Spanish input "${es}": 1. Fix any typos or spelling errors 2. Translate to French and English 3. Classify part of speech as exactly one of: verb, noun, adjective, adverb, phrase, other. Rules: verb=ends in -ar/-er/-ir or conjugated; noun=standalone noun or with article; adjective=describes noun; adverb=ends in -mente or muy/bien/mal/siempre/nunca; phrase=multi-word expression; other=preposition/conjunction/interjection. Return ONLY valid JSON, no markdown: {"es":"corrected","fr":"french","en":"english","pos":"pos"}` }]
      })
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(200).json({ es, fr: "", en: "", pos: "other" });
  }
}
