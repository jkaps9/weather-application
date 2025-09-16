import "./styles.css";
import { ReverseGeocodingAPI } from "./assets/scripts/ReverseGeocodingAPI.js";
import { WeatherController } from "./assets/scripts/WeatherController.js";

const weatherController = new WeatherController();

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \\
// //// BELOW IS FOR GETTING THE USERS LOCATION \\\\ \\

// const apiKey = import.meta.env.VITE_API_KEY;
// const dbHost = import.meta.env.VITE_DB_HOST;
// const reverseGeocodingAPI = new ReverseGeocodingAPI(apiKey);
// getUserLocation();

// function getUserLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(showPosition);
//   } else {
//     console.log("Geolocation is not supported by this browser.");
//   }
// }

// async function showPosition(position) {
//   const location = await reverseGeocodingAPI.getLocation(
//     position.coords.latitude,
//     position.coords.longitude
//   );

//   if (location === undefined) {
//     console.log("location not found...");
//   } else {
//     searchCity(location.city, location.country_code.toUpperCase());
//   }
// }
