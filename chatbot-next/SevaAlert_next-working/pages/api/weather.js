export default async function handler(req, res) {
  const { city } = req.query;
  if (!city) return res.status(400).send("Missing city param");
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return res.status(500).send("Server missing OPENWEATHER_API_KEY env var. See README.");
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${key}`;
  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      const txt = await fetchRes.text();
      return res.status(fetchRes.status).send(txt);
    }
    const data = await fetchRes.json();
    // return first 6 entries (approx 18 hours) to keep small
    data.list = data.list.slice(0, 6);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(String(err));
  }
}