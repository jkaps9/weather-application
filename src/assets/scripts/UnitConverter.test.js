const {
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  mmToInches,
  mbToInches,
  kmhToMph,
} = require('./UnitConverter');

describe('UnitConverter', () => {
  describe('fahrenheitToCelsius', () => {
    test('should correctly convert 32 F to 0 C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    test('should correctly convert 212 F to 100 C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });
  });

  describe('celsiusToFahrenheit', () => {
    test('should correctly convert 0 C to 32 F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    test('should correctly convert 100 C to 212 F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });
  });

  describe('mmToInches', () => {
    test('should correctly convert 25.4 mm to 1 inch', () => {
      expect(mmToInches(25.4)).toBeCloseTo(1);
    });
  });

  describe('mbToInches', () => {
    test('should correctly convert 33.8639 mb to 1 inch', () => {
      expect(mbToInches(33.8639)).toBeCloseTo(1);
    });
  });

  describe('kmhToMph', () => {
    test('should correctly convert 1 kmh to 0.621371 mph', () => {
      expect(kmhToMph(1)).toBeCloseTo(0.621371);
    });
  });
});
