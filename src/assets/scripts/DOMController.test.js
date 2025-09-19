import { DOMController } from './DOMController';
import { LocalStorage } from './LocalStorage';
// Mock LocalStorage to isolate the DOMController
jest.mock('./LocalStorage');

// A simplified version of the HTML structure needed by DOMController
const getMockDOM = () => {
  document.body.innerHTML = `
    <div class="main-container">
      <header>
        <div class="container">
          <button class="dark-mode-toggle"></button>
          <nav>
            <div class="dropdown">
              <button class="switch-units-button"></button>
              <div class="dropdown-menu">
                <button class="units-button" id="celsius"></button>
                <button class="units-button" id="fahrenheit"></button>
                <button class="units-button" id="kmh"></button>
                <button class="units-button" id="mph"></button>
                <button class="units-button" id="mm"></button>
                <button class="units-button" id="in"></button>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <section class="hero"></section>
        <div class="dropdown-search"></div>
        <section class="current-weather">
          <div class="container"></div>
        </section>
        <section class="daily-forecast">
          <div class="forecast-cards"></div>
        </section>
        <section class="hourly-forecast">
            <div class="card hourly-forecast-card">
              <div class="hourly-header">
                <div class="dropdown">
                  <button class="dropdown-button"></button>
                  <div class="dropdown-menu"></div>
                </div>
              </div>
              <div class="hourly-cards"></div>
            </div>
        </section>
      </main>
    </div>
  `;
};

// Mock data for testing
const mockLocation = { name: 'Test City', country: 'TC' };
const mockWeather = {
  current: {
    time: '2023-10-27T12:00:00Z',
    temperature: 20,
    feelsLike: 19,
    windSpeed: 10,
    precipitation: 1,
    visibility: 10000,
    surfacePressure: 1012,
    humidity: 60,
    uvIndex: 5,
    sunrise: '07:00',
    sunset: '18:00',
    icon: 'icon-sunny.webp',
    altText: 'Sunny',
  },
  daily: [
    { day: 'Sat', dayLong: 'Saturday', tempMin: 15, tempMax: 25, icon: 'icon-sunny.webp', altText: 'Sunny' },
    { day: 'Sun', dayLong: 'Sunday', tempMin: 16, tempMax: 26, icon: 'icon-partly-cloudy.webp', altText: 'Partly Cloudy' },
  ],
  hourly: {
    today: [
      { time: '13:00', temperature: 21, icon: 'icon-sunny.webp', altText: 'Sunny' },
      { time: '14:00', temperature: 22, icon: 'icon-sunny.webp', altText: 'Sunny' },
    ],
    all: [
      { dayName: 'Saturday', time: '13:00', temperature: 21, icon: 'icon-sunny.webp', altText: 'Sunny' },
      { dayName: 'Saturday', time: '14:00', temperature: 22, icon: 'icon-sunny.webp', altText: 'Sunny' },
    ]
  },
};


describe('DOMController', () => {
  let domController;

  beforeEach(() => {
    getMockDOM();
    LocalStorage.mockClear();
    domController = new DOMController();
  });

  test('should set location and weather data correctly', () => {
    domController.setLocation(mockLocation);
    domController.setWeather(mockWeather);
    expect(domController.location).toEqual(mockLocation);
    expect(domController.weather).toEqual(mockWeather);
  });

  describe('DOM Updates', () => {
    beforeEach(() => {
        domController.setLocation(mockLocation);
        domController.setWeather(mockWeather);
        domController.updateDOM();
    });

    test('should update the current weather section correctly', () => {
      const locationEl = document.querySelector('.weather-info .location');
      const tempEl = document.querySelector('.weather-info .current-temperature');

      expect(locationEl.textContent).toBe('Test City, TC');
      expect(tempEl.textContent).toBe('20°'); // Metric by default
    });

    test('should create the correct number of daily and hourly forecast cards', () => {
      const dailyCards = document.querySelectorAll('.daily-forecast .forecast-cards .card');
      const hourlyCards = document.querySelectorAll('.hourly-forecast .hourly-cards .card');

      expect(dailyCards.length).toBe(mockWeather.daily.length); // 2
      expect(hourlyCards.length).toBe(mockWeather.hourly.today.length); // 2
    });

    test('should switch units to Imperial when button is clicked', () => {
      const switchButton = document.querySelector('.switch-units-button');

      // Check initial state
      expect(domController.preferredTempUnit).toBe('C');
      let tempEl = document.querySelector('.weather-info .current-temperature');
      expect(tempEl.textContent).toBe('20°');

      // Act
      switchButton.click();

      // Assert
      expect(domController.preferredTempUnit).toBe('F');
      tempEl = document.querySelector('.weather-info .current-temperature');
      const expectedFahrenheit = Math.round((20 * 9/5) + 32); // 68
      expect(tempEl.textContent).toBe(`${expectedFahrenheit}°`);
    });
  });

  describe('Page State Changes', () => {
    test('should hide content and show "no results" message', () => {
      domController.setPageToNoReultsFound();

      const noResultsSection = document.querySelector('section.no-results');
      const currentWeatherSection = document.querySelector('section.current-weather');

      expect(noResultsSection).not.toBeNull();
      expect(noResultsSection.textContent).toContain('No search result found!');
      expect(currentWeatherSection.style.display).toBe('none');
    });

    test('should call reloader when retry button is clicked', () => {
      const mockReloader = jest.fn();
      jest.spyOn(domController, 'getReloader').mockReturnValue(mockReloader);

      domController.setPageToApiError();

      const apiErrorSection = document.querySelector('section.api-error');
      expect(apiErrorSection).not.toBeNull();

      // Test retry button
      const retryButton = apiErrorSection.querySelector('.retry-button');
      retryButton.click();
      expect(mockReloader).toHaveBeenCalledTimes(1);
    });

    test('should display search dropdown with locations', () => {
        const locations = [
            { name: 'City A', admin1: 'State A', country: 'CA' },
            { name: 'City B', admin1: 'State B', country: 'CB' },
        ];
        const callback = jest.fn();

        domController.updateSearchDropdown(locations, callback);

        const dropdown = document.querySelector('.dropdown-search');
        const items = dropdown.querySelectorAll('.search-item');

        expect(dropdown.classList.contains('visible')).toBe(true);
        expect(items.length).toBe(2);
        expect(items[0].textContent).toBe('City A, State A CA');

        // Test callback on click
        items[0].click();
        expect(callback).toHaveBeenCalledWith(locations[0]);
        expect(dropdown.classList.contains('visible')).toBe(false);
    });
  });
});
