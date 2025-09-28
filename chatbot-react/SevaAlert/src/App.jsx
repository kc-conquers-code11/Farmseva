import { useState, useEffect } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(false);

  const apikey = "6abb975398125fee8071a0409efa9b3c"; // replace with your OpenWeather API key

  // 🐖 Pig conditions
  const pigConditions = [
    { category: "Piglets (0–3 weeks)", temp: [30, 34], rh: [60, 70], note: "Avoid drafts; provide heat sources." },
    { category: "Grower pigs (15–50kg)", temp: [20, 28], rh: [50, 65], note: "Good ventilation; avoid excess moisture." },
    { category: "Finisher pigs (>50kg)", temp: [16, 24], rh: [50, 65], note: "Heat stress above 25°C with high humidity." },
    { category: "Adult sows/boars", temp: [16, 22], rh: [50, 70], note: "Shaded areas; wallowing/cooling in summer." },
  ];

  // 🐓 Poultry conditions
  const poultryConditions = [
    { category: "Boiler chicks (0–7d)", temp: [32, 34], rh: [60, 70], note: "Strong, gentle airflow; avoid chilling." },
    { category: "Boiler growers", temp: [26, 30], rh: [55, 65], note: "Drop temp by 2–3°C per week; constant air." },
    { category: "Boiler finishers", temp: [20, 24], rh: [50, 60], note: "Minimize ammonia; keep litter dry." },
    { category: "Layer hens", temp: [20, 24], rh: [50, 60], note: "Shell quality drops >24°C; ensure airflow." },
  ];

  // Fetch forecast and generate precautions
  const getWeatherInfo = async () => {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`
    );
    let jsonresponse = await response.json();

    if (jsonresponse.cod !== "200") {
      throw new Error("City not found");
    }

    // ✅ Pick only 2 days (at 12:00 noon)
    let forecastData = jsonresponse.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 2) // <-- only first 2 days
      .map((item) => {
        let pigPrecaution = "";
        let poultryPrecaution = "";

        // check pigs
        pigConditions.forEach((cond) => {
          const temp = item.main.temp;
          const rh = item.main.humidity;

          if (temp < cond.temp[0] || temp > cond.temp[1] || rh < cond.rh[0] || rh > cond.rh[1]) {
            pigPrecaution += `⚠ ${cond.category} → . ${cond.note}\n`;
          }
        });

        if (pigPrecaution === "") pigPrecaution = "✅ All pig categories in safe range.";

        // check poultry
        poultryConditions.forEach((cond) => {
          const temp = item.main.temp;
          const rh = item.main.humidity;

          if (temp < cond.temp[0] || temp > cond.temp[1] || rh < cond.rh[0] || rh > cond.rh[1]) {
            poultryPrecaution += `⚠ ${cond.category} → . ${cond.note}\n`;
          }
        });

        if (poultryPrecaution === "") poultryPrecaution = "✅ All poultry categories in safe range.";

        return {
          date: item.dt_txt.split(" ")[0],
          temp: item.main.temp,
          humidity: item.main.humidity,
          weather: item.weather[0].description,
          pigPrecaution,
          poultryPrecaution,
        };
      });

    return forecastData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = await getWeatherInfo();
      setForecast(data);
      setError(false);
    } catch {
      setError(true);
      setForecast([]);
    }
  };

  // ✅ Show popup alert for today's forecast (first item)
  useEffect(() => {
    if (forecast.length > 0) {
      const today = forecast[0];
      window.alert(
        `📢 Today's Weather Alert\n\n📅 Date: ${today.date}\n🌡 Temp: ${today.temp}°C\n💧 Humidity: ${today.humidity}%\n🌦 Weather: ${today.weather}\n\n👉 Pig Precautions:\n${today.pigPrecaution}\n\n👉 Poultry Precautions:\n${today.poultryPrecaution}`
      );
    }
  }, [forecast]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pig & Poultry Biosecurity Weather Alerts</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          required
        />
        <button type="submit">Get Forecast</button>
      </form>

      {error && <p style={{ color: "red" }}>⚠ City not found in API</p>}

      <div>
        {forecast.map((day, index) => (
          <div
            key={index}
            style={{
              border: "1px solid gray",
              padding: "10px",
              margin: "10px 0",
            }}
          >
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
