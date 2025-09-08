import { WeatherAPI } from "./WeatherAPI.js";
import { DOMController } from "./DOMController.js";

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
        console.log(
          "Current temperature:",
          data.weather.current.temperature + "°C"
        );
        console.log("Current:", data.weather.current);
        console.log("Hourly forecast:", data.weather.hourly);
        console.log("7-day forecast:", data.weather.daily);
        domController.setLocation(data.location);
        domController.setWeather(data.weather);
        domController.updateDOM();
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
