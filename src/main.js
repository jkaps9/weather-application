import "./styles.css";
import { WeatherAPI } from "./assets/scripts/WeatherAPI.js";
import { DOMController } from "./assets/scripts/DOMController.js";

const apiKey = import.meta.env.VITE_API_KEY;
const dbHost = import.meta.env.VITE_DB_HOST;

const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector("#search");
const weatherAPI = new WeatherAPI();
const domController = new DOMController();

searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  console.log("searching...");
  if (!query) {
    alert("enter a city");
  } else {
    console.log(`query:${query}`);
    getWeatherByCity(query)
      .then((data) => {
        if (data === undefined) {
          domController.setPageToNoReultsFound();
        } else {
          domController.setPageToResultsFound();
          domController.setLocation(data.location);
          domController.setWeather(data.weather);
          domController.updateDOM();
        }
      })
      .catch((error) => {
        domController.setPageToApiError();
        console.error("Failed to get weather:", error);
      });
  }
});

// Function to get weather by city name
async function getWeatherByCity(cityName) {
  try {
    // Get coordinates from city name
    const location = await weatherAPI.getCoordinates(cityName);
    if (location === undefined) {
      console.log("Location not found");
      return;
    } else {
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
    }
  } catch (error) {
    domController.setPageToApiError();
    console.error("Error getting weather:", error);
    throw error;
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  console.log(
    `Latitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`
  );
}

getLocation();
