const { LocalStorage } = require('./LocalStorage');

describe('LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('localStorageCheck', () => {
    test('should return true when Storage is available', () => {
      const ls = new LocalStorage();
      expect(ls.localStorageCheck()).toBe(true);
    });
  });

  describe('saveLocation', () => {
    test('should save location data to localStorage', () => {
      const ls = new LocalStorage();
      const location = {
        name: 'London',
        country: 'GB',
        latitude: 51.5074,
        longitude: -0.1278,
      };
      ls.saveLocation(location);

      expect(localStorage.getItem('name')).toBe('London');
      expect(localStorage.getItem('country')).toBe('GB');
      expect(localStorage.getItem('latitude')).toBe('51.5074');
      expect(localStorage.getItem('longitude')).toBe('-0.1278');
    });
  });

  describe('getSavedLocation', () => {
    test('should return undefined if localStorage is empty', () => {
      const ls = new LocalStorage();
      expect(ls.getSavedLocation()).toBeUndefined();
    });

    test('should return location data from localStorage', () => {
      const ls = new LocalStorage();
      const location = {
        name: 'Tokyo',
        country: 'JP',
        latitude: 35.6895,
        longitude: 139.6917,
      };
      localStorage.setItem('name', location.name);
      localStorage.setItem('country', location.country);
      localStorage.setItem('latitude', String(location.latitude));
      localStorage.setItem('longitude', String(location.longitude));

      const savedLocation = ls.getSavedLocation();
      expect(savedLocation).toEqual(location);
    });
  });
});
