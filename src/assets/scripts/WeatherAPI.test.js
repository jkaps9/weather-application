import { WeatherAPI } from './WeatherAPI';

describe('WeatherAPI', () => {
  let weatherApi;

  beforeEach(() => {
    weatherApi = new WeatherAPI();
    // Mock global.fetch for all tests in this suite
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore fetch to its original implementation
    global.fetch.mockRestore();
  });

  describe('getMultipleCoordinates', () => {
    test('should fetch and format coordinates for a city', async () => {
      const mockResponse = {
        results: [
          {
            latitude: 51.5074,
            longitude: -0.1278,
            name: 'London',
            country: 'United Kingdom',
            admin1: 'England',
          },
        ],
      };
      // Setup mock fetch to return a successful response
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const locations = await weatherApi.getMultipleCoordinates('London');

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('London'));
      expect(locations).toHaveLength(1);
      expect(locations[0]).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
        name: 'London',
        country: 'United Kingdom',
        admin1: 'England',
      });
    });

    test('should return undefined if no locations are found', async () => {
      const mockResponse = { results: [] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const locations = await weatherApi.getMultipleCoordinates('NonexistentCity');
      expect(locations).toBeUndefined();
    });

    test('should throw an error if the fetch call fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network failure');
      global.fetch.mockRejectedValue(error);

      // We expect the promise to reject with the same error
      await expect(weatherApi.getMultipleCoordinates('AnyCity')).rejects.toThrow('Network failure');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getWeatherData', () => {
    test('should fetch and format weather data for a location', async () => {
        const mockApiResponse = {
            current: {
              temperature_2m: 15.3,
              apparent_temperature: 14.8,
              relative_humidity_2m: 80,
              wind_speed_10m: 12.5,
              precipitation: 0.5,
              weather_code: 3,
              time: '2023-01-01T12:00',
              visibility: 20000,
              uv_index: 2,
              surface_pressure: 1005,
            },
            daily: {
              time: ['2023-01-01'],
              sunrise: ['2023-01-01T08:00'],
              sunset: ['2023-01-01T17:00'],
              weather_code: [3],
              temperature_2m_max: [16.1],
              temperature_2m_min: [10.9],
              precipitation_sum: [1.2],
            },
            hourly: {
              time: ['2023-01-01T12:00'],
              temperature_2m: [15.3],
              weather_code: [3],
              precipitation_probability: [20],
            },
            timezone: 'UTC',
          };

        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockApiResponse),
        });

        const weatherData = await weatherApi.getWeatherData(51.5, -0.1);

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('latitude=51.5&longitude=-0.1'));
        expect(weatherData.current.temperature).toBe(15); // Check that it's rounded
        expect(weatherData.daily).toHaveLength(1);
        expect(weatherData.hourly.today).toHaveLength(1);
        expect(weatherData.timezone).toBe('UTC');
    });

    test('should throw an error if the weather data fetch fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('API Error');
        global.fetch.mockRejectedValue(error);

        await expect(weatherApi.getWeatherData(0, 0)).rejects.toThrow('API Error');
        consoleErrorSpy.mockRestore();
    });
  });

  describe('Helper methods', () => {
    test('getWeatherIcon should return the correct icon name', () => {
        expect(weatherApi.getWeatherIcon(0)).toBe('icon-sunny.webp'); // Clear sky
        expect(weatherApi.getWeatherIcon(3)).toBe('icon-overcast.webp'); // Overcast
        expect(weatherApi.getWeatherIcon(61)).toBe('icon-rain.webp'); // Rain
        expect(weatherApi.getWeatherIcon(999)).toBe('icon-error.svg'); // Unknown
    });

    test('getWeatherDescription should return the correct description', () => {
        expect(weatherApi.getWeatherDescription(0)).toBe('Clear sky');
        expect(weatherApi.getWeatherDescription(95)).toBe('Thunderstorm');
        expect(weatherApi.getWeatherDescription(999)).toBe('Unknown');
    });
  });
});
