import * as UnitConverter from "./UnitConverter.js";
import { storeLocation } from "./LocalStorage.js";
import sunnyIcon from "../images/icon-sunny.webp";
import drizzleIcon from "../images/icon-drizzle.webp";
import fogIcon from "../images/icon-fog.webp";
import overcastIcon from "../images/icon-overcast.webp";
import partlyCloudyIcon from "../images/icon-partly-cloudy.webp";
import rainIcon from "../images/icon-rain.webp";
import snowIcon from "../images/icon-snow.webp";
import stormIcon from "../images/icon-storm.webp";
import errorIcon from "../images/icon-error.svg";
import retryIcon from "../images/icon-retry.svg";
import dropdownIcon from "../images/icon-dropdown.svg";

export class DOMController {
  #forecastCards = document.querySelector(".daily-forecast .forecast-cards");
  #hourlyCards = document.querySelector(".hourly-forecast .hourly-cards");
  #switchUnitsButton = document.querySelector(".switch-units-button");
  #unitsButtons = document.querySelectorAll(".units-button");

  constructor() {
    this.location = null;
    this.weather = null;
    this.preferredMeasurementSystem = "Metric"; // Metric or Imperial
    this.preferredTempUnit = "C"; // C or F
    this.preferredSpeedUnit = "km/h"; // km/h or mph
    this.preferredPrecipitationUnit = "mm"; // mm or in
    this.#addOnClickListeners();
  }

  setLocation(loc) {
    this.location = loc;
  }

  setWeather(weath) {
    this.weather = weath;
    this.#setDaysForHourlyForecastDropdown();
  }

  updateDOM() {
    this.#setWeather();
  }

  #formatDate(dt) {
    const date = new Date(dt);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);

    return formatter.format(date);
  }

  #setWeather() {
    if (!this.weather) {
      console.log("weather not set");
    } else {
      this.#createCurrentWeatherSection();
      this.#setDailyForecast();
      this.#setHourlyForecast();
    }
  }

  #createCurrentWeatherSection() {
    const currentWeatherSection = document.querySelector(
      "section.current-weather .container"
    );
    this.#removeAllChildren(currentWeatherSection);
    currentWeatherSection.appendChild(this.#createWeatherInfo());
    currentWeatherSection.appendChild(this.#createWeatherDetails());
  }

  #createWeatherInfo() {
    // Create the main div
    const weatherInfo = document.createElement("div");
    weatherInfo.className = "weather-info";

    // Create text elements
    const textElements = document.createElement("div");
    textElements.className = "text";

    const locationElement = document.createElement("p");
    locationElement.className = "location textpreset4";
    locationElement.textContent = `${this.location.name}, ${this.location.country}`;

    const dateElement = document.createElement("p");
    dateElement.className = "date textpreset6";

    const date = this.#formatDate(this.weather.current.time);
    dateElement.textContent = `${date}`;

    // add location and date to text element
    textElements.appendChild(locationElement);
    textElements.appendChild(dateElement);

    // Create weather icon
    const weatherImage = this.#getWeatherIcon(this.weather.current.icon);
    const weatherIcon = document.createElement("div");
    weatherIcon.className = "weather-icon";

    const weatherImg = document.createElement("img");
    weatherImg.className = "weather-icon-image";
    weatherImg.src = weatherImage;
    weatherImg.alt = this.weather.current.altText;

    // Add weather image to weather icon
    weatherIcon.appendChild(weatherImg);

    // Create temperature element
    const temperatureElement = document.createElement("p");
    temperatureElement.className = "current-temperature textpreset1";
    const currentTemp =
      this.preferredTempUnit === "F"
        ? Math.round(
            UnitConverter.celsiusToFahrenheit(this.weather.current.temperature)
          )
        : this.weather.current.temperature;
    temperatureElement.textContent = `${currentTemp}°`;

    // Create the save location button element
    const saveLocationButton = document.createElement("button");
    saveLocationButton.className = "save-location-button";
    saveLocationButton.textContent = "Save Location";
    saveLocationButton.addEventListener("click", () => {
      storeLocation(this.location);
      alert(
        `${this.location.name}, ${this.location.country} saved successfully`
      );
    });

    // Add all elements to weather info
    weatherInfo.appendChild(textElements);
    weatherInfo.appendChild(weatherIcon);
    weatherInfo.appendChild(temperatureElement);
    weatherInfo.appendChild(saveLocationButton);

    return weatherInfo;
  }

  #createWeatherDetails() {
    // Create the main div
    const weatherInfo = document.createElement("div");
    weatherInfo.className = "weather-details";

    const feelsLikeTemp =
      this.preferredTempUnit === "F"
        ? Math.round(
            UnitConverter.celsiusToFahrenheit(this.weather.current.feelsLike)
          )
        : this.weather.current.feelsLike;

    const currentWindSpeed =
      this.preferredSpeedUnit === "mph"
        ? Math.round(UnitConverter.kmhToMph(this.weather.current.windSpeed))
        : this.weather.current.windSpeed;

    const currentPrecipitation =
      this.preferredPrecipitationUnit === "in"
        ? Math.round(
            UnitConverter.mmToInches(this.weather.current.precipitation) * 100
          ) / 100
        : this.weather.current.precipitation;

    const currentVisibility =
      this.preferredSpeedUnit === "mph"
        ? `${Math.round(
            UnitConverter.kmhToMph(this.weather.current.visibility / 1000)
          )} mi`
        : `${Math.round(this.weather.current.visibility / 1000)} km`;

    const currentSurfacePressure =
      this.preferredPrecipitationUnit === "in"
        ? `${
            Math.round(
              UnitConverter.mbToInches(this.weather.current.surfacePressure) *
                100
            ) / 100
          } in`
        : `${this.weather.current.surfacePressure} mb`;

    const weatherDetails = {
      "Feels like": `${feelsLikeTemp}°`,
      Humidity: `${this.weather.current.humidity}%`,
      Wind: `${currentWindSpeed} ${this.preferredSpeedUnit}`,
      Precipitation: `${currentPrecipitation} ${this.preferredPrecipitationUnit}`,
      Visibility: `${currentVisibility}`,
      "UV Index": `${this.weather.current.uvIndex}`,
      Pressure: `${currentSurfacePressure}`,
      Sun: `${this.weather.current.sunrise}\n${this.weather.current.sunset}`,
    };

    for (let key in weatherDetails) {
      weatherInfo.appendChild(
        this.#createWeatherDetailCard(key, weatherDetails[key])
      );
    }

    return weatherInfo;
  }

  #createWeatherDetailCard(attribute, value) {
    const card = document.createElement("div");
    card.className = "card";

    const attributeElement = document.createElement("p");
    attributeElement.className = "textpreset6";
    attributeElement.textContent = `${attribute}`;

    const valueElement = document.createElement("p");
    valueElement.className = "textpreset3";

    valueElement.textContent = `${value}`;

    card.appendChild(attributeElement);
    card.appendChild(valueElement);

    return card;
  }

  #setDailyForecast() {
    if (!this.weather) {
      console.log("weather not set");
    } else {
      if (!this.#forecastCards) {
        console.error(
          "Forecast card container not found:",
          ".daily-forecast .forecast-cards"
        );
      } else {
        // Clear out any forecast cards that may currently exist
        this.#removeAllChildren(this.#forecastCards);

        // Create new cards
        this.weather.daily.forEach((dayData) => {
          const card = this.#createForecastCard(dayData);
          this.#forecastCards.appendChild(card);
        });
      }
    }
  }

  #createForecastCard(dayData) {
    // Create the main card div
    const card = document.createElement("div");
    card.className = "card";

    // Create day paragraph
    const dayElement = document.createElement("p");
    dayElement.className = "day textpreset6";
    dayElement.textContent = dayData.day;

    // Create weather icon container
    const iconContainer = document.createElement("div");
    iconContainer.className = "weather-icon";

    // Create weather icon image
    const weatherImage = this.#getWeatherIcon(dayData.icon);
    const iconImg = document.createElement("img");
    iconImg.src = weatherImage;
    iconImg.alt = dayData.altText;

    // Append image to container
    iconContainer.appendChild(iconImg);

    // Create temperature row container
    const tempRow = document.createElement("div");
    tempRow.className = "flex-row textpreset7";

    // Create low temperature span
    const lowTemp = document.createElement("span");
    lowTemp.className = "low-temp";
    const minTemp =
      this.preferredTempUnit === "F"
        ? Math.round(UnitConverter.celsiusToFahrenheit(dayData.tempMin))
        : dayData.tempMin;
    lowTemp.textContent = `${minTemp}°`;

    // Create high temperature span
    const highTemp = document.createElement("span");
    highTemp.className = "high-temp";
    const maxTemp =
      this.preferredTempUnit === "F"
        ? Math.round(UnitConverter.celsiusToFahrenheit(dayData.tempMax))
        : dayData.tempMax;
    highTemp.textContent = `${maxTemp}°`;

    // Append temperatures to row
    tempRow.appendChild(lowTemp);
    tempRow.appendChild(highTemp);

    // Append all elements to card
    card.appendChild(dayElement);
    card.appendChild(iconContainer);
    card.appendChild(tempRow);

    return card;
  }

  #setDaysForHourlyForecastDropdown() {
    const dropdownMenu = document.querySelector(
      ".hourly-forecast-card .dropdown-menu"
    );

    const days = this.weather.daily.map((day) => day.dayLong);
    const dropdownButton = document.querySelector(
      ".hourly-forecast-card .dropdown-button"
    );
    dropdownButton.innerHTML =
      days[0] +
      ` <img
                      src=${dropdownIcon}
                      alt="dropdown icon"
                    />`;

    this.#removeAllChildren(dropdownMenu);

    for (let i = 0; i < days.length; i++) {
      const div = document.createElement("div");
      div.className = "dropdown-option" + `${i === 0 ? " selected" : ""}`;
      const button = document.createElement("button");
      button.className = "day-button textpreset7";
      button.textContent = days[i];
      button.addEventListener("click", () => {
        this.#setHourlyForecastByDay(`${days[i]}`);
        // Remove all selected
        this.#removeSelectedFromDayDropdown();
        // only select this one
        div.className = "dropdown-option selected";
        dropdownButton.innerHTML =
          days[i] +
          ` <img
                      src=${dropdownIcon}
                      alt="dropdown icon"
                    />`;
      });
      div.appendChild(button);
      dropdownMenu.appendChild(div);
    }
  }

  #removeSelectedFromDayDropdown() {
    document.querySelectorAll(".dropdown-option").forEach((element) => {
      element.classList.remove("selected");
    });
  }

  #setHourlyForecast() {
    if (!this.weather) {
      console.error("weather not set");
    } else {
      if (!this.#forecastCards) {
        console.error(
          "Forecast card container not found:",
          ".daily-forecast .forecast-cards"
        );
      } else {
        // Clear out any hourly cards that may currently exist
        this.#removeAllChildren(this.#hourlyCards);

        // Create new cards
        this.weather.hourly.today.forEach((hourlyData) => {
          const card = this.#createHourlyCard(hourlyData);
          this.#hourlyCards.appendChild(card);
        });
      }
    }
  }

  #setHourlyForecastByDay(selectedDay) {
    if (!this.weather) {
      console.error("weather not set");
    } else if (!this.#hourlyCards) {
      console.error("Hourly cards container not found");
    } else {
      // Clear out any hourly cards that may currently exist
      this.#removeAllChildren(this.#hourlyCards);

      //Get hourly data for the selected day
      const dayHourlyData = this.#getHourlyDataForDay(selectedDay);

      // Create new cards
      dayHourlyData.forEach((hourlyData) => {
        const card = this.#createHourlyCard(hourlyData);
        this.#hourlyCards.appendChild(card);
      });
    }
  }

  #getHourlyDataForDay(selectedDay) {
    if (!this.weather?.hourly?.all) return [];

    return this.weather.hourly.all.filter((hour) => {
      return hour.dayName === selectedDay;
    });
  }

  #createHourlyCard(hourData) {
    // Create the main card div
    const card = document.createElement("div");
    card.className = "card hour-card flex-row";

    // Create weather icon container
    const iconContainer = document.createElement("div");
    iconContainer.className = "weather-icon";

    // Create weather icon image
    const weatherImage = this.#getWeatherIcon(hourData.icon);
    const iconImg = document.createElement("img");
    iconImg.src = weatherImage;
    iconImg.alt = hourData.altText;

    // Append image to container
    iconContainer.appendChild(iconImg);

    // Create time paragraph
    const timeElement = document.createElement("p");
    timeElement.className = "time textpreset5medium";
    timeElement.textContent = hourData.time;

    // Create temperature span
    const tempElement = document.createElement("span");
    tempElement.className = "temp textpreset7";
    const hourTemp =
      this.preferredTempUnit === "F"
        ? Math.round(UnitConverter.celsiusToFahrenheit(hourData.temperature))
        : hourData.temperature;
    tempElement.textContent = `${hourTemp}°`;

    // Append all elements to card
    card.appendChild(iconContainer);
    card.appendChild(timeElement);
    card.appendChild(tempElement);

    return card;
  }

  #removeAllChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.lastChild);
    }
  }

  #addOnClickListeners() {
    this.#switchUnitsButton.addEventListener("click", () =>
      this.#switchAllPreferredUnits()
    );

    this.#unitsButtons.forEach((button) => {
      button.addEventListener("click", (e) =>
        this.#handleUnitButtonClick(e.currentTarget)
      );
    });

    const body = document.querySelector("body");
    const darkModeToggle = document.querySelector(".dark-mode-toggle");

    darkModeToggle.addEventListener("click", () => {
      if (body.classList.contains("light")) {
        darkModeToggle.innerHTML = `<img src="src/assets/images/icon-sun.svg" alt="dark-mode-toggle" />`;
      } else {
        darkModeToggle.innerHTML = `<img src="src/assets/images/icon-moon.svg" alt="dark-mode-toggle" />`;
      }

      body.classList.toggle("light");
    });
  }

  #switchAllPreferredUnits() {
    this.#switchUnitsButton.innerHTML = `Switch to ${this.preferredMeasurementSystem}`;

    if (this.preferredMeasurementSystem === "Metric") {
      this.preferredMeasurementSystem = "Imperial";
      this.preferredTempUnit = "F";
      this.preferredSpeedUnit = "mph";
      this.preferredPrecipitationUnit = "in";
    } else if (this.preferredMeasurementSystem === "Imperial") {
      this.preferredMeasurementSystem = "Metric";
      this.preferredTempUnit = "C";
      this.preferredSpeedUnit = "km/h";
      this.preferredPrecipitationUnit = "mm";
    }

    this.#updatePreferenceButtons();
    this.#setWeather();
  }

  #handleUnitButtonClick(btn) {
    // If button is not already selected then do something
    if (!btn.classList.contains("selected")) {
      btn.classList.add("selected");
      if (btn.id === "fahrenheit") {
        this.preferredTempUnit = "F";
      } else if (btn.id === "celsius") {
        this.preferredTempUnit = "C";
      } else if (btn.id === "kmh") {
        this.preferredSpeedUnit = "km/h";
      } else if (btn.id === "mph") {
        this.preferredSpeedUnit = "mph";
      } else if (btn.id === "mm") {
        this.preferredPrecipitationUnit = "mm";
      } else if (btn.id === "in") {
        this.preferredPrecipitationUnit = "in";
      }

      this.#updatePreferenceButtons();
      this.#setWeather();
    }
  }

  #updatePreferenceButtons() {
    this.#unitsButtons.forEach((button) => {
      button.classList.remove("selected");
    });

    if (this.preferredTempUnit === "F") {
      document.querySelector("#fahrenheit").classList.add("selected");
    } else if (this.preferredTempUnit === "C") {
      document.querySelector("#celsius").classList.add("selected");
    }

    if (this.preferredSpeedUnit === "km/h") {
      document.querySelector("#kmh").classList.add("selected");
    } else if (this.preferredSpeedUnit === "mph") {
      document.querySelector("#mph").classList.add("selected");
    }

    if (this.preferredPrecipitationUnit === "mm") {
      document.querySelector("#mm").classList.add("selected");
    } else if (this.preferredPrecipitationUnit === "in") {
      document.querySelector("#in").classList.add("selected");
    }
  }

  setPageToNoReultsFound() {
    document.querySelector("section.current-weather").style = "display:none";
    document.querySelector("section.daily-forecast").style = "display:none";
    document.querySelector("section.hourly-forecast").style = "display:none";
    this.#createNoResultsSection();
  }

  setPageToResultsFound() {
    document.querySelector("section.current-weather").removeAttribute("style");
    document.querySelector("section.daily-forecast").removeAttribute("style");
    document.querySelector("section.hourly-forecast").removeAttribute("style");
    const noResults = document.querySelector("section.no-results");
    if (noResults) {
      noResults.remove();
    }
  }

  #createNoResultsSection() {
    const noResults = document.createElement("section");
    noResults.className = "no-results";

    const noResultsContainer = document.createElement("div");
    noResultsContainer.className = "container";

    const noResultsText = document.createElement("p");
    noResultsText.textContent = "No search result found!";
    noResultsText.className = "textpreset4";

    noResultsContainer.appendChild(noResultsText);
    noResults.appendChild(noResultsContainer);

    document.querySelector(".main-container").appendChild(noResults);
  }

  setPageToApiError() {
    document.querySelector("section.hero").style = "display:none";
    document.querySelector("section.current-weather").style = "display:none";
    document.querySelector("section.daily-forecast").style = "display:none";
    document.querySelector("section.hourly-forecast").style = "display:none";
    this.#createApiErrorSection();
  }

  #createApiErrorSection() {
    const apiError = document.createElement("section");
    apiError.className = "api-error";

    const apiErrorContainer = document.createElement("div");
    apiErrorContainer.className = "container";

    const errorImg = document.createElement("img");
    errorImg.src = errorIcon;
    errorImg.alt = "error icon";
    errorImg.className = "error-img";

    const apiErrorHeader = document.createElement("h1");
    apiErrorHeader.textContent = "Something went wrong";
    apiErrorHeader.className = "textpreset2";

    const apiErrorText = document.createElement("p");
    apiErrorText.textContent =
      "We couldn't connect to the server (API error). Please try again in a few moments.";
    apiErrorText.className = "textpreset5medium";

    const retryImg = document.createElement("img");
    retryImg.src = retryIcon;
    retryImg.alt = "retry icon";
    retryImg.className = "retry-img";

    const retryButton = document.createElement("button");
    retryButton.className = "dropdown-button retry-button textpreset7";
    retryButton.appendChild(retryImg);
    retryButton.innerHTML += "Retry";
    retryButton.addEventListener("click", () => {
      window.location.reload();
    });

    apiErrorContainer.appendChild(errorImg);
    apiErrorContainer.appendChild(apiErrorHeader);
    apiErrorContainer.appendChild(apiErrorText);
    apiErrorContainer.appendChild(retryButton);
    apiError.appendChild(apiErrorContainer);

    document.querySelector(".main-container").appendChild(apiError);
  }

  #getWeatherIcon(weatherIcon) {
    if (weatherIcon === "icon-sunny.webp") {
      return sunnyIcon;
    } else if (weatherIcon === "icon-partly-cloudy.webp") {
      return partlyCloudyIcon;
    } else if (weatherIcon === "icon-overcast.webp") {
      return overcastIcon;
    } else if (weatherIcon === "icon-fog.webp") {
      return fogIcon;
    } else if (weatherIcon === "icon-drizzle.webp") {
      return drizzleIcon;
    } else if (weatherIcon === "icon-rain.webp") {
      return rainIcon;
    } else if (weatherIcon === "icon-snow.webp") {
      return snowIcon;
    } else if (weatherIcon === "icon-storm.webp") {
      return stormIcon;
    }

    return errorIcon;
  }
}
