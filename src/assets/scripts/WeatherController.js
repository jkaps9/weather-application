import { WeatherAPI } from "./WeatherAPI";
import { DOMController } from "./DOMController";
import { LocalStorage } from "./LocalStorage";

export class WeatherController {
  constructor() {
    this.weatherAPI = new WeatherAPI();
    this.domController = new DOMController();
    this.localStorage = new LocalStorage();
    this.init();
  }

  init() {
    const searchButton = document.querySelector(".search-button");
    const searchInput = document.querySelector("#search");
    const favoritesIcon = document.querySelector(".favorites-icon");

    if (!searchButton || !searchInput) {
      console.error("Required DOM elements not found");
      return;
    }

    searchButton.addEventListener("click", () => this.handleSearch());

    favoritesIcon.addEventListener("click", () => this.loadFavoriteLocations());

    // Add Enter key support
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    this.getUserLocation();
  }

  async handleSearch() {
    const searchInput = document.querySelector("#search");
    const query = searchInput.value?.trim();

    if (!this.validateInput(query)) {
      alert("Please enter a city name");
      //   this.domController.showError("Please enter a city name");
      return;
    }

    try {
      //   this.domController.setLoadingState(true);
      const locations = await this.getLocationsByCity(query);

      if (!locations?.length) {
        this.domController.setPageToNoReultsFound();
        return;
      }

      // If single location, get weather directly
      if (locations.length === 1) {
        await this.getWeatherAndUpdateDOM(locations[0]);
      } else {
        // Multiple locations - show dropdown
        this.domController.updateSearchDropdown(locations, (location) =>
          this.getWeatherAndUpdateDOM(location)
        );
      }
    } catch (error) {
      this.handleError("Failed to search for weather data", error);
    } finally {
      //   this.domController.setLoadingState(false);
    }
  }

  validateInput(query) {
    return query && query.length > 0 && query.length < 100;
  }

  async getLocationsByCity(cityName, countryCode = null) {
    return this.executeWithErrorHandling(
      () => this.weatherAPI.getMultipleCoordinates(cityName, countryCode),
      "Failed to get location data"
    );
  }

  async getWeatherByLocation(location) {
    if (!location?.latitude || !location?.longitude) {
      throw new Error("Invalid location data");
    }

    return this.executeWithErrorHandling(
      () =>
        this.weatherAPI.getWeatherData(location.latitude, location.longitude),
      "Failed to get weather data"
    );
  }

  async getWeatherAndUpdateDOM(location) {
    try {
      this.domController.setPageToLoading();
      const weather = await this.getWeatherByLocation(location);

      if (!weather) {
        this.domController.setPageToNoReultsFound();
        return;
      }

      this.domController.setPageToResultsFound();
      this.domController.setLocation(location);
      this.domController.setWeather(weather);
      this.domController.updateDOM();
    } catch (error) {
      this.handleError("Failed to get weather for location", error);
    }
  }

  async executeWithErrorHandling(apiCall, errorMessage) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw new Error(errorMessage);
    }
  }

  handleError(message, error) {
    console.error(`${message}:`, error);
    this.domController.setPageToApiError();
  }

  async loadFavoriteLocations() {
    const searchDropdown = document.querySelector(".dropdown-search");
    if (searchDropdown.classList.contains("visible")) {
      this.domController.hideSearchDropdown();
    } else {
      const locations = this.localStorage.getFavoriteLocations();
      this.domController.updateSearchDropdown(locations, (location) =>
        this.getWeatherAndUpdateDOM(location)
      );
    }
  }

  async getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) =>
        this.showPosition(position)
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  async showPosition(position) {
    const loc = {
      name: "Current Location",
      country: "",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    if (loc && loc.latitude && loc.longitude) {
      await this.getWeatherAndUpdateDOM(loc);
    }
  }
}
