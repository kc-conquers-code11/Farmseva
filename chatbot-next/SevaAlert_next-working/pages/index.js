import {useState} from "react";

const pigConditions = [
  { category: "Piglets (0–3 weeks)", temp: [30, 34], rh: [60, 70], note: "Avoid drafts; provide heat sources." },
  { category: "Grower pigs (15–50kg)", temp: [20, 28], rh: [50, 65], note: "Good ventilation; avoid excess moisture." },
  { category: "Finisher pigs (>50kg)", temp: [16, 24], rh: [50, 65], note: "Heat stress above 25°C with high humidity." },
  { category: "Adult sows/boars", temp: [16, 22], rh: [50, 70], note: "Shaded areas; wallowing/cooling in summer." },
];

const poultryConditions = [
  { category: "Chicks (0–3 weeks)", temp: [32, 35], rh: [50, 70], note: "Provide brooder heat; avoid drafts." },
  { category: "Growers", temp: [20, 26], rh: [45, 65], note: "Good ventilation; dry litter." },
  { category: "Layers", temp: [18, 24], rh: [45, 60], note: "Avoid heat stress during laying." },
  { category: "Broilers (market age)", temp: [20, 26], rh: [50, 70], note: "Manage feed and ventilation for growth." },
];

function decidePrecautions(tempC, humidity) {
  let pigPrec = "No special precautions.";
  let poulPrec = "No special precautions.";
  // simple rules
  if (tempC >= 30 || humidity >= 75) {
    pigPrec = "High heat risk — provide cooling, shade, and extra water for pigs.";
    poulPrec = "High heat risk — cool houses, provide ventilation and fresh water.";
  } else if (tempC <= 10) {
    pigPrec = "Cold stress risk — provide bedding and localized heat sources for piglets.";
    poulPrec = "Cold risk — ensure brooder heat for chicks and draft control.";
  } else if (humidity >= 80) {
    pigPrec = "High humidity — improve ventilation and reduce moisture in pens.";
    poulPrec = "High humidity — dry litter and improve airflow to reduce disease risk.";
  }
  return { pigPrec, poulPrec };
}

export default function Home(){
  const [city,setCity] = useState("");
  const [forecast,setForecast] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  async function fetchWeather(e){
    e && e.preventDefault();
    if(!city) { setError("Enter a city"); return; }
    setLoading(true); setError("");
    try{
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if(!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // data expected: list of daily entries with temp, humidity, weather, date
      const mapped = data.list.map(item=>{
        const tempC = Math.round(item.main.temp - 273.15);
        const humidity = item.main.humidity;
        const weather = item.weather?.[0]?.description || "";
        const {pigPrec,poulPrec} = decidePrecautions(tempC, humidity);
        return { date: new Date(item.dt * 1000).toLocaleString(), temp: tempC, humidity, weather, pigPrecaution: pigPrec, poultryPrecaution: poulPrec };
      });
      setForecast(mapped);
    }catch(err){
      console.error(err);
      setError("Failed to fetch weather. Make sure your API key is set on the server.");
      setForecast([]);
    }finally{setLoading(false);}
  }

  return (
    <div className="container">
      <h1>SevaAlert — Farm Weather & Animal Precautions</h1>
      <p>Enter a city to get current weather and simple pig/poultry guidance.</p>
      <form onSubmit={fetchWeather} style={{display:"flex",gap:8,marginTop:12}}>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Mumbai, India" />
        <button type="submit" disabled={loading}>{loading ? "Loading..." : "Get Weather"}</button>
      </form>
      {error && <p style={{color:"red"}}>{error}</p>}
      <div className="weather-grid">
        {forecast.length===0 && <div className="card">No data. Search for a city.</div>}
        {forecast.map((day, idx)=> (
          <div key={idx} className="card">
            <h4>{day.date}</h4>
            <p>🌡 Temp: {day.temp}°C</p>
            <p>💧 Humidity: {day.humidity}%</p>
            <p>🌦 Weather: {day.weather}</p>
            <h5>🐖 Pig Precautions</h5>
            <pre>{day.pigPrecaution}</pre>
            <h5>🐓 Poultry Precautions</h5>
            <pre>{day.poultryPrecaution}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
