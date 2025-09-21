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
    test('should initialize and NOT fetch weather if no location is saved', () => {
      // Arrange
      LocalStorage.prototype.getSavedLocation.mockReturnValue(undefined);

      // Act
      new WeatherController();

      // Assert
      expect(LocalStorage.prototype.getSavedLocation).toHaveBeenCalledTimes(1);
      expect(WeatherAPI.prototype.getWeatherData).not.toHaveBeenCalled();
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
});
