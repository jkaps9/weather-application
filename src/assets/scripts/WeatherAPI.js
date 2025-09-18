// Weather API functions using Open-Meteo
export class WeatherAPI {
  constructor() {
    this.baseURL = "https://api.open-meteo.com/v1/forecast";
    this.geocodingURL = "https://geocoding-api.open-meteo.com/v1/search";
  }

  // Get coordinates from city name
  async getMultipleCoordinates(cityName, countryCode = "") {
    const countryParameter =
      countryCode === "" || !countryCode ? `` : `&countryCode=${countryCode}`;
    try {
      const response = await fetch(
        `${this.geocodingURL}?name=${encodeURIComponent(
          cityName
        )}&count=5&language=en&format=json${countryParameter}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const locations = [];

        for (let i = 0; i < data.results.length; i++) {
          const location = data.results[i];
          const loc = {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            country: location.country,
            admin1: location.admin1, // state/province
          };
          locations.push(loc);
        }

        return locations;
      } else {
        // throw new Error("Location not found");
        return;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      throw error;
    }
  }

  // Get complete weather data (current, hourly, daily)
  async getWeatherData(latitude, longitude) {
    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "visibility",
        "uv_index",
        "surface_pressure",
      ].join(","),
      hourly: [
        "temperature_2m",
        "weather_code",
        "precipitation_probability",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "sunrise",
        "sunset",
      ].join(","),
      timezone: "auto",
      forecast_days: 7,
    });

    try {
      const response = await fetch(`${this.baseURL}?${params}`);
      const data = await response.json();

      return this.formatWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  }

  // Format the API response into a more usable structure
  formatWeatherData(data) {
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        time: data.current.time,
        icon: this.getWeatherIcon(data.current.weather_code),
        altText: this.getWeatherDescription(data.current.weather_code),
        visibility: data.current.visibility,
        uvIndex: data.current.uv_index,
        surfacePressure: data.current.surface_pressure,
        sunrise: this.getTime(data.daily.sunrise[0]),
        sunset: this.getTime(data.daily.sunset[0]),
      },
      hourly: this.formatHourlyData(data.hourly),
      daily: this.formatDailyData(data.daily),
      timezone: data.timezone,
    };
  }

  // Format hourly data for next 24 hours
  formatHourlyData(hourly) {
    const allHourlyData = [];
    const hourlyByDay = {};

    for (let i = 0; i < hourly.time.length; i++) {
      const time = new Date(hourly.time[i]);
      const dayKey = time.toDateString();

      const hourData = {
        time: time
          .toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })
          .toLowerCase(),
        temperature: Math.round(hourly.temperature_2m[i]),
        weatherCode: hourly.weather_code[i],
        precipitationProbability: hourly.precipitation_probability[i],
        icon: this.getWeatherIcon(hourly.weather_code[i]),
        altText: this.getWeatherDescription(hourly.weather_code[i]),
        date: time.toISOString().split("T")[0], // YYYY-MM-DD format
        dayName: time.toLocaleDateString("en-US", { weekday: "long" }),
      };

      // Add to flat array
      allHourlyData.push(hourData);

      // Group by day for easier access
      if (!hourlyByDay[dayKey]) {
        hourlyByDay[dayKey] = [];
      }
      hourlyByDay[dayKey].push(hourData);
    }

    return {
      all: allHourlyData,
      today: allHourlyData.slice(0, 24),
      byDay: hourlyByDay,
    };
  }

  // Format daily data for 7-day forecast
  formatDailyData(daily) {
    const forecast = [];
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const longDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (let i = 0; i < daily.time.length; i++) {
      const date = new Date(daily.time[i]);
      forecast.push({
        day: shortDays[date.getUTCDay()],
        dayLong: longDays[date.getUTCDay()],
        date: daily.time[i],
        weatherCode: daily.weather_code[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        precipitation: daily.precipitation_sum[i],
        icon: this.getWeatherIcon(daily.weather_code[i]),
        altText: this.getWeatherDescription(daily.weather_code[i]),
      });
    }

    return forecast;
  }

  getTime(dateTime) {
    const dateObject = new Date(dateTime);
    const localTime = dateObject.toLocaleTimeString([], { timeStyle: "short" });

    return localTime;
  }

  // Get weather icon class/name based on weather code
  getWeatherIcon(weatherCode) {
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
    return "icon-error.svg";
  }

  // Convert weather codes to readable descriptions
  getWeatherDescription(weatherCode) {
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
