// src/api/weatherApi.js
const API_KEY = "167d3e864a478dd049344cd10f6a54f9"; // you provided this key
const BASE = "https://api.openweathermap.org/data/2.5/weather";

export async function getWeatherByPincode(pincode) {
  try {
    const url = `${BASE}?zip=${encodeURIComponent(pincode)},IN&units=metric&appid=${API_KEY}`;
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`WeatherAPI error: ${resp.status} ${txt}`);
    }
    const data = await resp.json();
    const temp = data?.main?.temp ?? 28;
    const humidity = data?.main?.humidity ?? 65;
    const wind = data?.wind?.speed ?? 3;
    const rain = (data?.rain && (data.rain["1h"] ?? data.rain["3h"] ?? 0)) ?? 0;
    const condition = (data.weather && data.weather[0] && data.weather[0].main) || "Clear";

    return {
      ok: true,
      temp,
      humidity,
      wind,
      rain,
      condition,
      raw: data
    };
  } catch (err) {
    return {
      ok: false,
      temp: 28,
      humidity: 65,
      wind: 3,
      rain: 0,
      condition: "Clear",
      error: err.message
    };
  }
}
