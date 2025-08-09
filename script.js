const key = "841df15e43a8f242495f5afd3c47e4ae";

let sunriseTime, sunsetTime;

const currentIcon = document.querySelector(".current-weather__icon");
const appIcon = document.querySelector(".heading-icon");
const body = document.body;

function kelvinToF(kelvin) {
  return Math.round(((kelvin - 273.15) * 9) / 5 + 32) + "°F";
}

function formatHour(hour) {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? hour + "am" : (hour - 12) + "pm";
}

function clearWeatherClasses() {
  body.classList.remove(
    "clear-sky-day",
    "haze-day",
    "rainy-day",
    "clouds-day",
    "clear-sky-night",
    "clouds-night"
  );
  currentIcon.style.color = "";
  appIcon.style.color = "";
  document.querySelector(".heading-text").style.color = "";
  body.style.backgroundColor = "";
}

function updateBackground(condition, currentTime) {
  clearWeatherClasses();

  const currentHour = currentTime.getHours();
  const isDay =
    sunriseTime &&
    sunsetTime &&
    currentHour >= sunriseTime.getHours() &&
    currentHour < sunsetTime.getHours();

  if (isDay) {
    switch (condition) {
      case "Clear":
        body.classList.add("clear-sky-day");
        currentIcon.setAttribute("name", "sunny-outline");
        break;
      case "Haze":
        body.classList.add("haze-day");
        currentIcon.setAttribute("name", "cloud");
        break;
      case "Rain":
        body.classList.add("rainy-day");
        currentIcon.setAttribute("name", "rainy");
        break;
      case "Clouds":
        body.classList.add("clouds-day");
        currentIcon.setAttribute("name", "cloud");
        currentIcon.style.color = "rgb(204,204,204)";
        break;
      default:
        body.style.backgroundColor = "#ffffff";
        currentIcon.setAttribute("name", "cloud-outline");
    }
  } else {
    switch (condition) {
      case "Clear":
        body.classList.add("clear-sky-night");
        currentIcon.setAttribute("name", "moon-outline");
        break;
      case "Clouds":
        body.classList.add("clouds-night");
        currentIcon.setAttribute("name", "cloudy-night");
        currentIcon.style.color = "#CCCCCC";
        document.querySelector(".heading-text").style.color = "#fff";
        appIcon.setAttribute("name", "moon-outline");
        break;
      default:
        body.style.backgroundColor = "#000000";
        currentIcon.setAttribute("name", "moon-outline");
    }
  }
}

function updateHourlyIcons(forecastConditions) {
  const hourlyIcons = document.querySelectorAll(".hourly-forecast__icon");
  forecastConditions.forEach((condition, i) => {
    const icon = hourlyIcons[i];
    if (!icon) return;
    icon.style.color = "";
    switch (condition) {
      case "Rain":
        icon.setAttribute("name", "rainy");
        icon.style.color = "#4682b4";
        break;
      case "Clouds":
        icon.setAttribute("name", "cloud");
        icon.style.color = "#CCCCCC";
        break;
      case "Snow":
        icon.setAttribute("name", "snow");
        icon.style.color = "#ddd";
        break;
      default:
        icon.setAttribute("name", "partly-sunny-outline");
    }
  });
}

function updateForecast(data) {
  // We take the first 10 forecast items (3 hour intervals)
  const forecastItems = data.list.slice(0, 10);

  const hours = forecastItems.map((f) => {
    const d = new Date(f.dt_txt);
    return formatHour(d.getHours());
  });

  const temps = forecastItems.map((f) => kelvinToF(f.main.temp));
  const conditions = forecastItems.map((f) => f.weather[0].main);

  // Update hourly forecast DOM
  document.querySelectorAll(".hour").forEach((el, i) => {
    if (hours[i]) el.textContent = hours[i];
  });
  document.querySelectorAll(".temp").forEach((el, i) => {
    if (temps[i]) el.textContent = temps[i];
  });
  updateHourlyIcons(conditions);
}

function metersToMiles(m) {
  return Math.round(m * 0.000621371);
}

function hpaToInHg(hpa) {
  return (hpa * 0.02953).toFixed(2);
}

function updateAllWeather(data) {
  const weather = data.weather[0];
  const main = data.main;
  const wind = data.wind;
  const sys = data.sys;

  // Update text fields
  document.querySelector(
    ".current-weather__description"
  ).textContent =
    weather.description[0].toUpperCase() + weather.description.slice(1);

  // FIX typo: changed humdity -> humidity everywhere in CSS and HTML classes
  document.querySelector(".current-weather__humidity").textContent = `Humidity: ${main.humidity}%`;

  document.querySelector(".current-weather__feel").textContent = `Feels like: ${kelvinToF(
    main.feels_like
  )}`;

  document.querySelector(".current-weather__wind-speed").textContent = `${Math.floor(
    wind.speed
  )} Mph Winds`;

  document.querySelector(".current-weather__wind-gusts").textContent = wind.gust
    ? `${Math.floor(wind.gust)} Mph Gusts`
    : "No gusts data";

  document.querySelector(".current-temp").textContent = kelvinToF(main.temp);

  document.querySelector(".high").textContent = `High: ${kelvinToF(main.temp_max)}`;

  document.querySelector(".low").textContent = `Low: ${kelvinToF(main.temp_min)}`;

  document.querySelector(".current-location").textContent = data.name;

  document.querySelector(".current-condition").textContent = weather.main;

  sunriseTime = new Date(sys.sunrise * 1000);
  sunsetTime = new Date(sys.sunset * 1000);

  // Format sunrise/sunset as HH:MM am/pm
  document.querySelector(
    ".sunrise-text"
  ).textContent = sunriseTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  document.querySelector(
    ".sunset-text"
  ).textContent = sunsetTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  document.querySelector(".visibility-text").textContent = `${metersToMiles(
    data.visibility
  )} miles`;

  document.querySelector(".pressure-text").textContent = `${hpaToInHg(
    main.pressure
  )} inHg`;

  updateBackground(weather.main, new Date());
}

function fetchWeatherByCoords(lat, lon) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`;

  fetch(currentUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    })
    .then((data) => {
      updateAllWeather(data);
      return fetch(forecastUrl);
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    })
    .then(updateForecast)
    .catch(console.error);
}

function fetchWeatherByCity(city) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`;

  fetch(currentUrl)
    .then((res) => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then((data) => {
      updateAllWeather(data);
      return fetch(forecastUrl);
    })
    .then((res) => {
      if (!res.ok) throw new Error("Forecast not found");
      return res.json();
    })
    .then(updateForecast)
    .catch((err) => {
      alert(err.message);
      console.error(err);
    });
}

function getLocationAndUpdate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("Geolocation failed, loading default city.");
        fetchWeatherByCity("New York"); // fallback city
      }
    );
  } else {
    fetchWeatherByCity("New York");
  }
}

// Format and display date & time
function updateDateTime() {
  const dateEl = document.querySelector(".date");
  const now = new Date();
  const options = { month: "long", day: "numeric", year: "numeric" };
  dateEl.textContent = now.toLocaleDateString(undefined, options);

  const timeEl = document.querySelector(".time");
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  timeEl.textContent = `${timeStr} CST`;
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  getLocationAndUpdate();
  updateDateTime();
  setInterval(updateDateTime, 1000);

  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = searchInput.value.trim();
      if (city) fetchWeatherByCity(city);
    }
  });
});
