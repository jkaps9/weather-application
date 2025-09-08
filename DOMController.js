export class DOMController {
  #weatherInfoCard = document.querySelector(".weather-info");
  #locationText = document.querySelector(".weather-info .location");
  #dateText = document.querySelector(".weather-info .date");
  #currentTemperatureText = document.querySelector(
    ".weather-info .current-temperature"
  );

  #currentWeatherIcon = document.querySelector(
    ".weather-info .weather-icon-image"
  );

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
      const weatherIcon = this.#getWeatherIcon(
        this.weather.current.weatherCode
      );
      this.#currentWeatherIcon.src = `./assets/images/${weatherIcon}`;
      const weatherDescription = this.#getWeatherDescription(
        this.weather.current.weatherCode
      );
      console.log(weatherDescription);
    }
  }

  // Get weather icon class/name based on weather code
  #getWeatherIcon(weatherCode) {
    /* 
      Code	      Description
      0	          Clear sky
      1, 2, 3	    Mainly clear, partly cloudy, and overcast
      45, 48	    Fog and depositing rime fog
      51, 53, 55	Drizzle: Light, moderate, and dense intensity
      56, 57	    Freezing Drizzle: Light and dense intensity
      61, 63, 65	Rain: Slight, moderate and heavy intensity
      66, 67	    Freezing Rain: Light and heavy intensity
      71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
      77	        Snow grains
      80, 81, 82	Rain showers: Slight, moderate, and violent
      85, 86	    Snow showers slight and heavy
      95 *	      Thunderstorm: Slight or moderate
      96, 99 *	  Thunderstorm with slight and heavy hail
    */

    if (weatherCode === 0 || weatherCode === 1) return "icon-sunny.webp";
    if (weatherCode === 2) return "icon-partly-cloudy.webp";
    if (weatherCode === 3) return "icon-overcast.webp";
    if (weatherCode >= 45 && weatherCode <= 48) return "icon-fog.webp";
    if (weatherCode >= 51 && weatherCode <= 57) return "icon-drizzle.webp";
    if (
      (weatherCode >= 61 && weatherCode <= 67) ||
      (weatherCode >= 80 && weatherCode <= 82)
    )
      return "icon-rain.webp";
    if (weatherCode >= 71 && weatherCode <= 77) return "icon-snow.webp";
    if (weatherCode >= 95) return "icon-storm.webp";
    return "icon-overcast.webp";
  }

  // Convert weather codes to readable descriptions
  #getWeatherDescription(weatherCode) {
    console.log(`weather_code: ${weatherCode}`);
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snowformat dates grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    return weatherCodes[weatherCode] || "Unknown";
  }
}
