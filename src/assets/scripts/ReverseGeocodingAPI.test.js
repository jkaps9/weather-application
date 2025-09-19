import { ReverseGeocodingAPI } from './ReverseGeocodingAPI';

describe('ReverseGeocodingAPI', () => {
  const API_KEY = 'test-api-key';
  let geoApi;

  beforeEach(() => {
    geoApi = new ReverseGeocodingAPI(API_KEY);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  describe('getLocation', () => {
    test('should fetch and return the location for given coordinates', async () => {
      const mockResponse = {
        features: [
          {
            properties: {
              city: 'Paris',
              country_code: 'fr',
            },
          },
        ],
      };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const location = await geoApi.getLocation(48.85, 2.35);

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`lat=48.85&lon=2.35&apiKey=${API_KEY}`));
      expect(location).toEqual({
        city: 'Paris',
        country_code: 'fr',
      });
    });

    test('should return undefined if the API finds no location', async () => {
      const mockResponse = { features: [] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const location = await geoApi.getLocation(0, 0);
      expect(location).toBeUndefined();
    });

    test('should return undefined and log an error if fetch fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('API down');
      global.fetch.mockRejectedValue(error);

      const location = await geoApi.getLocation(0, 0);

      expect(location).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user location:', error);

      consoleErrorSpy.mockRestore();
    });
  });
});
