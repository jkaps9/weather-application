import * as UnitConverter from "./UnitConverter.js";

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
    const weatherIcon = document.createElement("div");
    weatherIcon.className = "weather-icon";

    const weatherImg = document.createElement("img");
    weatherImg.className = "weather-icon-image";
    weatherImg.src = `assets/images/${this.weather.current.icon}`;
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

    // Add all elements to weather info
    weatherInfo.appendChild(textElements);
    weatherInfo.appendChild(weatherIcon);
    weatherInfo.appendChild(temperatureElement);

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

    const weatherDetails = {
      "Feels like": `${feelsLikeTemp}°`,
      Humidity: `${this.weather.current.humidity}%`,
      Wind: `${currentWindSpeed} ${this.preferredSpeedUnit}`,
      Precipitation: `${currentPrecipitation} ${this.preferredPrecipitationUnit}`,
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
    const iconImg = document.createElement("img");
    iconImg.src = `assets/images/${dayData.icon}`;
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
                      src="assets/images/icon-dropdown.svg"
                      alt="dropdown icon"
                    />`;

    this.#removeAllChildren(dropdownMenu);

    for (let i = 0; i < days.length; i++) {
      const div = document.createElement("div");
      div.className = "dropdown-option" + `${i === 0 ? " selected" : ""}`;
      const button = document.createElement("button");
      button.className = "day-button textpreset7";
      button.textContent = days[i];
      div.appendChild(button);
      dropdownMenu.appendChild(div);
    }
  }

  #setHourlyForecast() {
    if (!this.weather) {
      console.log("weather not set");
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
        this.weather.hourly.forEach((hourlyData) => {
          const card = this.#createHourlyCard(hourlyData);
          this.#hourlyCards.appendChild(card);
        });
      }
    }
  }

  #createHourlyCard(hourData) {
    // Create the main card div
    const card = document.createElement("div");
    card.className = "card hour-card flex-row";

    // Create weather icon container
    const iconContainer = document.createElement("div");
    iconContainer.className = "weather-icon";

    // Create weather icon image
    const iconImg = document.createElement("img");
    iconImg.src = `assets/images/${hourData.icon}`;
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

    const dropdownButtons = document.querySelectorAll(".dropdown-button");
    dropdownButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        e.currentTarget.nextElementSibling.classList.toggle("active")
      );
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
}
