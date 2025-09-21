import { WeatherController } from './WeatherController';
import { WeatherAPI } from './WeatherAPI';
import { DOMController } from './DOMController';
import { LocalStorage } from './LocalStorage';

// Mock the entire modules
jest.mock('./WeatherAPI');
jest.mock('./DOMController');
jest.mock('./LocalStorage');

describe('WeatherController', () => {
  beforeEach(() => {
    // Set up a basic DOM structure for the controller to interact with
    document.body.innerHTML = `
      <input id="search" value="" />
      <button class="search-button"></button>
    `;
    // Use jest.clearAllMocks() for robust test isolation
    jest.clearAllMocks();
  });

  describe('Initialization and loading saved location', () => {
    test('should attempt to get user location if no location is saved', () => {
      // Arrange
      LocalStorage.prototype.getSavedLocation.mockReturnValue(undefined);
      // Spy on getUserLocation to make sure it's called
      const getUserLocationSpy = jest.spyOn(WeatherController.prototype, 'getUserLocation');

      // Act
      new WeatherController();

      // Assert
      expect(LocalStorage.prototype.getSavedLocation).toHaveBeenCalledTimes(1);
      expect(getUserLocationSpy).toHaveBeenCalledTimes(1);
      expect(WeatherAPI.prototype.getWeatherData).not.toHaveBeenCalled();

      // Clean up the spy
      getUserLocationSpy.mockRestore();
    });

    test('should initialize and fetch weather if a location is saved', async () => {
      // Arrange
      const savedLocation = { name: 'Berlin', country: 'DE', latitude: 52.52, longitude: 13.40 };
      const weatherData = { temp: 15, condition: 'Sunny' };

      LocalStorage.prototype.getSavedLocation.mockReturnValue(savedLocation);
      WeatherAPI.prototype.getWeatherData.mockResolvedValue(weatherData);

      // Act
      new WeatherController();
      // Wait for async operations in init() to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(LocalStorage.prototype.getSavedLocation).toHaveBeenCalledTimes(1);
      expect(WeatherAPI.prototype.getWeatherData).toHaveBeenCalledWith(savedLocation.latitude, savedLocation.longitude);

      const mockDomController = DOMController.mock.instances[0];
      expect(mockDomController.setPageToResultsFound).toHaveBeenCalled();
      expect(mockDomController.setLocation).toHaveBeenCalledWith(savedLocation);
      expect(mockDomController.setWeather).toHaveBeenCalledWith(weatherData);
      expect(mockDomController.updateDOM).toHaveBeenCalled();
    });
  });

  describe('handleSearch', () => {
    let controller;
    let mockDomController;
    let mockWeatherAPI;

    beforeEach(() => {
        LocalStorage.prototype.getSavedLocation.mockReturnValue(undefined);
        controller = new WeatherController();
        mockDomController = DOMController.mock.instances[0];
        mockWeatherAPI = WeatherAPI.mock.instances[0];
        global.alert = jest.fn();
    });

    test('should alert user if search input is empty', async () => {
        document.querySelector('#search').value = '';
        await controller.handleSearch();
        expect(global.alert).toHaveBeenCalledWith('Please enter a city name');
        expect(mockWeatherAPI.getMultipleCoordinates).not.toHaveBeenCalled();
    });

    test('should show "no results" if API returns no locations', async () => {
        document.querySelector('#search').value = 'NonExistentCity';
        mockWeatherAPI.getMultipleCoordinates.mockResolvedValue([]);

        await controller.handleSearch();

        expect(mockWeatherAPI.getMultipleCoordinates).toHaveBeenCalledWith('NonExistentCity', null);
        expect(mockDomController.setPageToNoReultsFound).toHaveBeenCalledTimes(1);
    });

    test('should fetch weather directly if API returns one location', async () => {
        const location = { name: 'London', country: 'GB', latitude: 51.5, longitude: -0.1 };
        const weather = { temp: 20 };
        document.querySelector('#search').value = 'London';
        mockWeatherAPI.getMultipleCoordinates.mockResolvedValue([location]);
        mockWeatherAPI.getWeatherData.mockResolvedValue(weather);

        await controller.handleSearch();

        expect(mockWeatherAPI.getMultipleCoordinates).toHaveBeenCalledWith('London', null);
        expect(mockWeatherAPI.getWeatherData).toHaveBeenCalledWith(location.latitude, location.longitude);
        expect(mockDomController.setLocation).toHaveBeenCalledWith(location);
        expect(mockDomController.setWeather).toHaveBeenCalledWith(weather);
        expect(mockDomController.updateDOM).toHaveBeenCalled();
    });

    test('should show dropdown if API returns multiple locations', async () => {
        const locations = [ { name: 'London', country: 'GB' }, { name: 'London', country: 'US' } ];
        document.querySelector('#search').value = 'London';
        mockWeatherAPI.getMultipleCoordinates.mockResolvedValue(locations);

        await controller.handleSearch();

        expect(mockWeatherAPI.getMultipleCoordinates).toHaveBeenCalledWith('London', null);
        expect(mockDomController.updateSearchDropdown).toHaveBeenCalledWith(locations, expect.any(Function));
    });

    test('should handle API errors during search', async () => {
        // Suppress expected console.error output
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        document.querySelector('#search').value = 'SomeCity';
        const error = new Error('API Failure');
        mockWeatherAPI.getMultipleCoordinates.mockRejectedValue(error);

        await controller.handleSearch();

        expect(mockDomController.setPageToApiError).toHaveBeenCalledTimes(1);

        // Restore console.error
        consoleErrorSpy.mockRestore();
    });
  });

  describe('User Geolocation', () => {
    let mockGeolocation;

    beforeEach(() => {
        // Mock navigator.geolocation
        mockGeolocation = {
            getCurrentPosition: jest.fn(),
        };
        Object.defineProperty(global.navigator, 'geolocation', {
            value: mockGeolocation,
            configurable: true,
        });
        LocalStorage.prototype.getSavedLocation.mockReturnValue(undefined);
    });

    afterEach(() => {
        // Clean up the mock to avoid affecting other tests
        Object.defineProperty(global.navigator, 'geolocation', {
            value: null,
            configurable: true,
        });
        // Restore all mocks
        jest.restoreAllMocks();
    });

    test('should request user location on init if geolocation is available', () => {
        // Act
        new WeatherController();
        // Assert
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    test('should log message on init if geolocation is not available', () => {
        // Arrange
        Object.defineProperty(global.navigator, 'geolocation', {
            value: undefined,
            configurable: true,
        });
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Act
        new WeatherController();

        // Assert
        expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('Geolocation is not supported by this browser.');
    });

    test('should fetch weather for the position received', async () => {
        // Arrange
        const controller = new WeatherController();
        const mockPosition = {
            coords: {
                latitude: 48.85,
                longitude: 2.35,
            },
        };
        // Spy on the method that should be called, and mock its implementation
        const getWeatherSpy = jest.spyOn(controller, 'getWeatherAndUpdateDOM').mockImplementation(() => Promise.resolve());

        // Act
        await controller.showPosition(mockPosition);

        // Assert
        const expectedLocation = {
            name: "Current City",
            country: "Current Country",
            latitude: mockPosition.coords.latitude,
            longitude: mockPosition.coords.longitude,
        };
        expect(getWeatherSpy).toHaveBeenCalledWith(expectedLocation);
    });
  });
});
