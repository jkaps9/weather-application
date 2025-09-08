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

  constructor() {
    this.location = null;
    this.weather = null;
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
    this.#setCurrentTemperature();
    this.#setCurrentWeatherIcon();
    this.#setWeatherDetails();
    this.#setDailyForecast();
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

  #setCurrentTemperature() {
    if (!this.weather) {
      console.log("weather not set");
    } else {
      this.#currentTemperatureText.textContent = `${this.weather.current.temperature}°`;
    }
  }

  #setCurrentWeatherIcon() {
    if (!this.weather) {
      console.log("weather not set");
    } else {
      this.#currentWeatherIcon.src = `assets/images/${this.weather.current.icon}`;
    }
  }

  #setWeatherDetails() {
    if (!this.weather) {
      console.log("weather not set");
    } else {
      this.#currentFeelsLike.textContent = `${this.weather.current.feelsLike}°`;
      this.#currentRelativeHumidity.textContent = `${this.weather.current.humidity}%`;
      this.#currentWindSpeed.textContent = `${this.weather.current.windSpeed} mph`;
      this.#currentPrecipitation.textContent = `${this.weather.current.precipitation} in`;
    }
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

        console.log(this.weather.daily);
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
    lowTemp.textContent = `${dayData.tempMin}°`;

    // Create high temperature span
    const highTemp = document.createElement("span");
    highTemp.className = "high-temp";
    highTemp.textContent = `${dayData.tempMax}°`;

    // Append temperatures to row
    tempRow.appendChild(lowTemp);
    tempRow.appendChild(highTemp);

    // Append all elements to card
    card.appendChild(dayElement);
    card.appendChild(iconContainer);
    card.appendChild(tempRow);

    return card;
  }

  #removeAllChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.lastChild);
    }
  }
}
