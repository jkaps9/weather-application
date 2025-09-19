const { fahrenheitToCelsius, celsiusToFahrenheit } = require('./UnitConverter');

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
});
