import * as UnitConverter from "./UnitConverter.js";

export class DOMController {
  #weatherInfoCard = document.querySelector(".weather-info");
  #locationText = document.querySelector(
    ".current-weather .weather-info .location"
  );

  #dateText = document.querySelector(".current-weather .weather-info .date");
  #currentTemperatureText = document.querySelector(
    ".current-weather .weather-info .current-temperature"
  );

  #currentWeatherIcon = document.querySelector(
    ".weather-info .weather-icon-image"
  );

  #currentFeelsLike = document.querySelector(
    ".current-weather .weather-details .feels-like"
  );

  #currentRelativeHumidity = document.querySelector(
    ".current-weather .weather-details .relative-humidity"
  );

  #currentWindSpeed = document.querySelector(
    ".current-weather .weather-details .wind-speed"
  );

  #currentPrecipitation = document.querySelector(
    ".current-weather .weather-details .precipitation"
  );

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
    this.#setLocationText();
  }

  #setLocationText() {
    if (!this.location) {
      console.log("location not set");
    } else {
      this.#locationText.textContent = `${this.location.name}, ${this.location.country}`;
    }
  }

  setWeather(weath) {
    this.weather = weath;
    this.#setDateText();
    this.#setWeather();
  }

  #setDateText() {
    if (!this.weather) {
      console.log("weather not set");
    } else {
      const date = this.#formatDate(this.weather.current.time);
      this.#dateText.textContent = `${date}`;
    }
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
      this.#setWeatherDetails();
      this.#setDailyForecast();
      this.#setHourlyForecast();
    }
  }

  #setWeatherDetails() {
    const currentTemp =
      this.preferredTempUnit === "F"
        ? Math.round(
            UnitConverter.celsiusToFahrenheit(this.weather.current.temperature)
          )
        : this.weather.current.temperature;
    this.#currentTemperatureText.textContent = `${currentTemp}°`;

    this.#currentWeatherIcon.src = `assets/images/${this.weather.current.icon}`;

    const feelsLikeTemp =
      this.preferredTempUnit === "F"
        ? Math.round(
            UnitConverter.celsiusToFahrenheit(this.weather.current.feelsLike)
          )
        : this.weather.current.feelsLike;
    this.#currentFeelsLike.textContent = `${feelsLikeTemp}°`;
    this.#currentRelativeHumidity.textContent = `${this.weather.current.humidity}%`;

    const currentWindSpeed =
      this.preferredSpeedUnit === "mph"
        ? Math.round(UnitConverter.kmhToMph(this.weather.current.windSpeed))
        : this.weather.current.windSpeed;
    this.#currentWindSpeed.textContent = `${currentWindSpeed} ${this.preferredSpeedUnit}`;

    const currentPrecipitation =
      this.preferredPrecipitationUnit === "in"
        ? Math.round(
            UnitConverter.mmToInches(this.weather.current.precipitation) * 100
          ) / 100
        : this.weather.current.precipitation;
    this.#currentPrecipitation.textContent = `${currentPrecipitation} ${this.preferredPrecipitationUnit}`;
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
    /* 
      <div class="card">
        <p class="day textpreset6">Tue</p>
        <div class="weather-icon">
          <img src="assets/images/icon-drizzle.webp" alt="drizzle" />
        </div>
        <div class="flex-row textpreset7">
          <span class="low-temp">16°</span>
          <span class="high-temp">22°</span>
        </div>
      </div>
    */

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
