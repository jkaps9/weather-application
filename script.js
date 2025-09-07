import { WeatherAPI } from "./WeatherAPI.js";

const searchUrl =
  "https://geocoding-api.open-meteo.com/v1/search?name=berlin&count=3&language=en&format=json"; //replace spaces with +

const weatherUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m";

// const weatherData = getWeather(weatherUrl);

// async function getWeather(url) {
//   try {
//     let response = await fetch(url, { mode: "cors" });
//     let json = await response.json();
//     console.log(json);
//     return json;
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// }

//TODO: REMOVE LATER...DOING THIS NOW TO REDUCE API CALLS DURING DEVELOPMENT
// getWeatherFromLocal();

async function getWeatherFromLocal() {
  fetch("data.json")
    .then((response) => response.json()) // Parse JSON
    .then((data) => {
      //   console.log(data);
      processWeatherData(data);
    }) // Work with JSON data
    .catch((error) => console.error("Error fetching JSON:", error));
}

function processWeatherData(data) {
  const dateTime = data.current.time;

  const currentTemperature = data.current.temperature_2m;
  const temperatureUnits = data.current_units.temperature_2m;

  const feelsLikeTemperature = data.current.apparent_temperature;

  const relativeHumidity = data.current.relative_humidity_2m;

  const windSpeed = data.current.wind_speed_10m;
  const windSpeedUnits = data.current_units.wind_speed_10m;

  const precipitation = data.current.precipitation;
  const precipitationUnits = data.current_units.precipitation;

  console.log(`${dateTime} 
    Current temp: ${currentTemperature}${temperatureUnits} 
    Feels like: ${feelsLikeTemperature}${temperatureUnits}  
    Humidity: ${relativeHumidity}%
    Wind: ${windSpeed} ${windSpeedUnits}
    Precipitation: ${precipitation} ${precipitationUnits}
    `);
}

const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector("#search");
const weatherAPI = new WeatherAPI();

searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  console.log("searching...");
  if (!query) {
    alert("enter a city");
  } else {
    console.log(`query:${query}`);
    getWeatherByCity(query)
      .then((data) => {
        console.log(
          "Current temperature:",
          data.weather.current.temperature + "°C"
        );
        console.log("Hourly forecast:", data.weather.hourly);
        console.log("7-day forecast:", data.weather.daily);
      })
      .catch((error) => {
        console.error("Failed to get weather:", error);
      });
  }
});

// Function to get weather by city name
async function getWeatherByCity(cityName) {
  try {
    // Get coordinates from city name
    const location = await weatherAPI.getCoordinates(cityName);
    console.log(`Found location: ${location.name}, ${location.country}`);

    // Get weather data using coordinates
    const weather = await weatherAPI.getWeatherData(
      location.latitude,
      location.longitude
    );

    return {
      location,
      weather,
    };
  } catch (error) {
    console.error("Error getting weather:", error);
    throw error;
  }
}
