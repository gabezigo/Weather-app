let key = "841df15e43a8f242495f5afd3c47e4ae";
let sunriseTime, sunsetTime;
let lat, lon;

const currentIcon = document.querySelector(".current-weather__icon");

const appIcon = document.querySelector(".heading-icon");

// Function to convert temperature from Kelvin to Fahrenheit
function updateTemp(kelvin) {
  const fahrenheit = Math.round(((kelvin - 273.15) * 9) / 5 + 32);
  return fahrenheit + "°F";
}

// Function to format the hour in 12-hour format with "am" and "pm"
function updateHours(hour) {
  let formattedHour;
  if (hour === 0) {
    formattedHour = "12am";
  } else if (hour === 12) {
    formattedHour = "12pm";
  } else if (hour < 12) {
    formattedHour = hour + "am";
  } else {
    formattedHour = hour - 12 + "pm";
  }
  return formattedHour;
}

// Function to update the background color based on weather condition
function updateBackgroundColor(current, currentTime) {
  const body = document.body;
  const currentHour = currentTime.getHours();

  // Check if it's daytime or nighttime based on current time and sunrise/sunset times
  const isDay =
    currentHour >= sunriseTime.getHours() &&
    currentHour < sunsetTime.getHours();

  if (isDay) {
    // Set daytime background color
    switch (current) {
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
        currentIcon.style.color = "rgb(204, 204, 204)";
        break;
      // Add more cases for other weather conditions during daytime
      default:
        // Set default daytime background color
        body.style.backgroundColor = "#ffffff"; // Default to white
        break;
    }
  } else {
    // Set nighttime background color
    switch (current) {
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
      // Add more cases for other weather conditions during nighttime
      default:
        // Set default nighttime background color
        body.style.backgroundColor = "#000000"; // Default to black
        break;
    }
  }
}

// Function to update the forecast data on the page
function updateForecast(data) {
  // Process the forecast data and update the page accordingly
  console.log(data);
  const updatedHoursArray = [];
  const updatedTempsArray = [];

  const forecasts = data.list;
  forecasts.forEach((forecast, index) => {
    const hour = forecast.dt_txt;
    const hour2 = new Date(hour);
    const hour3 = hour2.getHours();
    const updatedHours = updateHours(hour3);
    updatedHoursArray.push(updatedHours);

    const temps = forecast.main.temp;
    const tempString = updateTemp(temps);
    updatedTempsArray.push(tempString);
  });

  const tempEls = document.querySelectorAll(".temp");
  tempEls.forEach((tempEl, index) => {
    tempEl.textContent = updatedTempsArray[index];
  });

  const hoursEl = document.querySelectorAll(".hour");
  hoursEl.forEach((hourEl, index) => {
    hourEl.textContent = updatedHoursArray[index];
  });

  // Update hourly icons once after processing all forecasts
  const upcomingForecasts = forecasts.map(
    (forecast) => forecast.weather[0].main // Extract weather condition directly
  );

  // Check if upcomingForecasts is an array, if not, convert it to an array with a single element
  const forecastArray = Array.isArray(upcomingForecasts)
    ? upcomingForecasts
    : [upcomingForecasts];

  // Call updateHourlyIcons with the forecastArray
  updateHourlyIcons(forecastArray);
}

function updateHourlyIcons(forecastConditions) {
  console.log("Forecast Conditions:", forecastConditions); // Log the forecast conditions

  const hourlyIcons = document.querySelectorAll(".hourly-forecast__icon");

  // Iterate over each forecast condition and update the corresponding icon
  forecastConditions.forEach((forecast, index) => {
    // Log the upcoming forecast for this icon
    console.log("Upcoming Forecast:", forecast);

    // Get the corresponding icon element
    const icon = hourlyIcons[index];

    // Check the upcoming forecast and update the icon accordingly
    switch (forecast) {
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
      // Add more cases for other weather conditions
      default:
        console.log("No matching forecast condition found");
        // For any other condition, you can handle it here
        break;
    }
  });
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;

  let layer = "precipitation_new";
  let z = 2;
  let x = 1;
  let y = 1;

  const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  let forecastApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`;

  // Fetch weather data from the API
  fetch(api)
    .then((response) => {
      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Parse the JSON response
      return response.json();
    })
    .then((data) => {
      //   Log the weather data to the console
      const weatherDescriptionEl = document.querySelector(
        ".current-weather__description"
      );

      const description = data.weather[0].description;
      const upperCase =
        description.charAt(0).toUpperCase() + description.slice(1);
      weatherDescriptionEl.textContent = upperCase;

      const humidityEl = document.querySelector(".current-weather__humdity");
      const humidity = data.main.humidity;
      humidityEl.textContent = "Humidity: " + humidity + "%";

      const feelsLikeEl = document.querySelector(".current-weather__feel");
      const feelsLike = data.main.feels_like;
      const updateTempFeel = updateTemp(feelsLike);
      feelsLikeEl.textContent = "Feels like: " + updateTempFeel;

      const windSpeedEl = document.querySelector(
        ".current-weather__wind-speed"
      );
      const windGustsEl = document.querySelector(
        ".current-weather__wind-gusts"
      );

      const windSpeed = data.wind.speed;
      const windGust = data.wind.gust;

      windSpeedEl.textContent = removeDecimals(windSpeed) + " Mph Winds";

      windGustsEl.textContent = removeDecimals(windGust) + " Mph Gusts";

      const kelvin = data.main.temp;
      const temp = updateTemp(kelvin);
      // Set the temperature as the text content of the HTML element
      const tempElement = document.querySelector(".current-weather h2");
      tempElement.textContent = temp;

      const high = data.main.temp_max;
      const updatedHigh = updateTemp(high);

      const highEl = document.querySelector(".high");
      highEl.textContent = "High: " + updatedHigh;

      const low = data.main.temp_min;
      const updatedLow = updateTemp(low);

      const lowEl = document.querySelector(".low");
      lowEl.textContent = "Low: " + updatedLow;

      const location = data.name;
      const locationEl = document.querySelector(".current-location");
      locationEl.textContent = location;

      const currentweatherEl = document.querySelector(".current-condition");
      const current = data.weather[0].main;
      currentweatherEl.textContent = current;

      // Get sunrise and sunset times
      sunriseTime = new Date(data.sys.sunrise * 1000);
      sunsetTime = new Date(data.sys.sunset * 1000);

      let sunriseTimestamp = data.sys.sunrise;
      let sunsetTimestamp = data.sys.sunset;

      // Convert Unix timestamps to JavaScript Date objects
      let sunrise = new Date(sunriseTimestamp * 1000)
        .toLocaleTimeString()
        .slice(0, -6);
      let sunset = new Date(sunsetTimestamp * 1000)
        .toLocaleTimeString()
        .slice(0, -6);

      // get sunset,sunrise classes
      const sunriseEl = document.querySelector(".sunrise-text");
      const sunsetEl = document.querySelector(".sunset-text");

      // set text content for sunset, runrise
      sunriseEl.textContent = sunrise + "am";
      sunsetEl.textContent = sunset + "pm";

      // Get visiblity
      const visibility = data.visibility;

      // get variable
      const visibilityEl = document.querySelector(".visibility-text");

      // convert to miles
      const toMiles = metersToMiles(visibility);

      // set text content
      visibilityEl.textContent = toMiles + " miles";

      // get pressure
      const pressure = data.main.pressure;

      // convert pressure unit to inHg
      const updateUnit = changePressureUnit(pressure);

      // get pressure class
      const pressureEl = document.querySelector(".pressure-text");

      // set pressure text content
      pressureEl.textContent = updateUnit + " inHg";

      // Get current time
      const currentTime = new Date();

      updateBackgroundColor(current, currentTime);

      console.log(forecastApi);

      fetchHourlyForecast(forecastApi);

      console.log(data);
    })
    .catch((error) => {
      // Log any errors to the console
      console.error("Error fetching weather data:", error);
    });
}

function removeDecimals(round) {
  return Math.floor(round);
}

function metersToMiles(meters) {
  let metersEl = 10;
  return Math.round(metersEl * 0.621371);
}

function changePressureUnit(unit) {
  const hpaToInHg = 0.02953;
  return (unit * hpaToInHg).toFixed(2);
}

function fetchHourlyForecast(forecastApi) {
  // Fetch hourly forecast data from the API
  fetch(forecastApi)
    .then((response) => {
      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Parse the JSON response
      return response.json();
    })
    .then((data) => {
      // Log the forecast data to the console
      console.log(data);

      // Example: Display the first forecast entry
      const firstForecast = data.list[0];
      const forecastTemperature = firstForecast.main.temp;
      console.log("First forecast temperature:", forecastTemperature);

      // Update the page with the forecast data
      updateForecast(data);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error fetching forecast data:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // Call getLocation to initiate the process of retrieving the user's location
  getLocation();

  // Select the search input element
  const searchInput = document.querySelector(".search-input");

  // Add event listener for input change
  searchInput.addEventListener("input", function () {
    const cityName = searchInput.value.trim(); // Get the entered city name

    if (cityName !== "") {
      // If a city name is entered, fetch weather data for that city
      fetchWeatherData(cityName);
    }
  });

  // Function to fetch weather data for the searched city
  function fetchWeatherData(cityName) {
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}`;

    // Fetch weather data from the API
    fetch(api)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Update the DOM elements with the new weather data
        updateDOMWithData(data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  }

  // Function to update DOM elements with weather data
  function updateDOMWithData(data) {
    // Update temperature
    const kelvin = data.main.temp;
    const temp = updateTemp(kelvin);
    const tempElement = document.querySelector(".current-weather h2");
    tempElement.textContent = temp;

    // Update high temperature
    const high = data.main.temp_max;
    const updatedHigh = updateTemp(high);
    const highEl = document.querySelector(".high");
    highEl.textContent = "High: " + updatedHigh;

    // Update low temperature
    const low = data.main.temp_min;
    const updatedLow = updateTemp(low);
    const lowEl = document.querySelector(".low");
    lowEl.textContent = "Low: " + updatedLow;

    // Update location
    const location = data.name;
    const locationEl = document.querySelector(".location");
    locationEl.textContent = location;

    // Update current weather condition
    const currentweatherEl = document.querySelector(".current-condition");
    const current = data.weather[0].main;
    currentweatherEl.textContent = current;

    // Get sunrise and sunset times
    sunriseTime = new Date(data.sys.sunrise * 1000);
    sunsetTime = new Date(data.sys.sunset * 1000);

    // Get current time
    const currentTime = new Date();

    // Update background color based on weather condition and time
    updateBackgroundColor(current, currentTime);
  }

  let date = document.querySelector(".date");
  console.log(date); // Use const dateElement instead of date
  let newDate = new Date();

  const month = newDate.toLocaleString("default", { month: "long" }); // Get the full month name
  const day = newDate.getDate(); // Get the day of the month
  const year = newDate.getFullYear(); // Get the full year

  const formattedDate = `${month} ${day}, ${year}`;

  date.textContent = formattedDate;

  function updateTime() {
    const currentTimeElement = document.querySelector(".time");
    const now = new Date();
    const timeString = now.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    currentTimeElement.textContent = timeString + " CST";
  }

  // Update time initially
  updateTime();

  // Update time every second
  setInterval(updateTime, 1000);
});
