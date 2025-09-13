import "./styles.css";
import { WeatherAPI } from "./assets/scripts/WeatherAPI.js";
import { DOMController } from "./assets/scripts/DOMController.js";
import { ReverseGeocodingAPI } from "./assets/scripts/ReverseGeocodingAPI.js";
import { storeLocation, getLocation } from "./assets/scripts/LocalStorage.js";

const loc = {
  city: "Nanuet",
  country: "United States",
  latitude: 41.08871,
  longitude: -74.01347,
};

storeLocation(loc);

const loc_retrieved = getLocation();

const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector("#search");
const weatherAPI = new WeatherAPI();
const domController = new DOMController();

searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  if (!query) {
    alert("enter a city");
  } else {
    searchCity(query);
  }
});

function searchCity(city, country_code) {
  getWeatherByCity(city, country_code)
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

// Function to get weather by city name
async function getWeatherByCity(cityName, country_code) {
  try {
    // Get coordinates from city name
    const location = await getLocationByCity(cityName, country_code);
    if (location === undefined) {
      console.log("Location not found");
      return;
    } else {
      // Get weather data using coordinates
      const weather = await getWeatherByLocation(location);

      if (weather === undefined) {
        console.log("Weather not found");
        return;
      } else {
        return {
          location,
          weather,
        };
      }
    }
  } catch (error) {
    domController.setPageToApiError();
    console.error("Error getting weather:", error);
    throw error;
  }
}

async function getLocationByCity(cityName, country_code) {
  // Function takes in a city name, and optionally a country code.
  // Function should return the location
  try {
    const location = await weatherAPI.getCoordinates(cityName, country_code);
    if (location === undefined) {
      console.log("Location not found");
      return;
    } else {
      return location;
    }
  } catch (error) {
    domController.setPageToApiError();
    console.error("Error getting weather:", error);
    throw error;
  }
}

async function getWeatherByLocation(location) {
  // Function takes in a location
  // Function should return the weather
  try {
    if (location === undefined) {
      console.log("Location not found");
      return;
    } else {
      // Get weather data using coordinates
      const weather = await weatherAPI.getWeatherData(
        location.latitude,
        location.longitude
      );

      if (weather === undefined) {
        console.log("weather not found");
        return;
      } else {
        return weather;
      }
    }
  } catch (error) {
    domController.setPageToApiError();
    console.error("Error getting weather:", error);
    throw error;
  }
}

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \\
// //// BELOW IS FOR GETTING THE USERS LOCATION \\\\ \\

// const apiKey = import.meta.env.VITE_API_KEY;
// const dbHost = import.meta.env.VITE_DB_HOST;
// const reverseGeocodingAPI = new ReverseGeocodingAPI(apiKey);
// getUserLocation();

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

async function showPosition(position) {
  const location = await reverseGeocodingAPI.getLocation(
    position.coords.latitude,
    position.coords.longitude
  );

  if (location === undefined) {
    console.log("location not found...");
  } else {
    searchCity(location.city, location.country_code.toUpperCase());
  }
}
