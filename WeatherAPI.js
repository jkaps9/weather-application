// Weather API functions using Open-Meteo
export class WeatherAPI {
  constructor() {
    this.baseURL = "https://api.open-meteo.com/v1/forecast";
    this.geocodingURL = "https://geocoding-api.open-meteo.com/v1/search";
  }

  // Get coordinates from city name
  async getCoordinates(cityName) {
    try {
      const response = await fetch(
        `${this.geocodingURL}?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          country: location.country,
          admin1: location.admin1, // state/province
        };
      } else {
        throw new Error("Location not found");
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
      },
      hourly: this.formatHourlyData(data.hourly),
      daily: this.formatDailyData(data.daily),
      timezone: data.timezone,
    };
  }

  // Format hourly data for next 24 hours
  formatHourlyData(hourly) {
    const next24Hours = [];
    const now = new Date();

    for (let i = 0; i < 24 && i < hourly.time.length; i++) {
      const time = new Date(hourly.time[i]);
      next24Hours.push({
        time: time
          .toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })
          .toLowerCase(),
        temperature: Math.round(hourly.temperature_2m[i]),
        weatherCode: hourly.weather_code[i],
        precipitationProbability: hourly.precipitation_probability[i],
      });
    }

    return next24Hours;
  }

  // Format daily data for 7-day forecast
  formatDailyData(daily) {
    const forecast = [];

    for (let i = 0; i < daily.time.length; i++) {
      const date = new Date(daily.time[i]);
      forecast.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: daily.time[i],
        weatherCode: daily.weather_code[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        precipitation: daily.precipitation_sum[i],
      });
    }

    return forecast;
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
      77: "Snow grains",
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

  // Get weather icon class/name based on weather code
  getWeatherIcon(weatherCode) {
    if (weatherCode === 0 || weatherCode === 1) return "icon-sunny.webp";
    if (weatherCode === 2) return "icon-partly-cloudy.webp";
    if (weatherCode === 3) return "icon-cloudy.webp";
    if (weatherCode >= 51 && weatherCode <= 67) return "icon-rainy.webp";
    if (weatherCode >= 71 && weatherCode <= 86) return "icon-snowy.webp";
    if (weatherCode >= 95) return "icon-stormy.webp";
    return "icon-cloudy.webp";
  }
}

/*
// Usage examples:
const weatherAPI = new WeatherAPI();

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

// Function to get weather by coordinates (useful for geolocation)
async function getWeatherByCoordinates(lat, lon) {
  try {
    const weather = await weatherAPI.getWeatherData(lat, lon);
    return weather;
  } catch (error) {
    console.error("Error getting weather:", error);
    throw error;
  }
}
*/

// Example usage:
/*
// Get weather for a specific city
getWeatherByCity('London')
  .then(data => {
    console.log('Current temperature:', data.weather.current.temperature + '°C');
    console.log('Hourly forecast:', data.weather.hourly);
    console.log('7-day forecast:', data.weather.daily);
  })
  .catch(error => {
    console.error('Failed to get weather:', error);
  });

// Get weather using coordinates
getWeatherByCoordinates(51.5074, -0.1278) // London coordinates
  .then(weather => {
    console.log('Weather data:', weather);
  });
*/
