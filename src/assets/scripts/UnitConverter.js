export function fahrenheitToCelsius(tempInFahrenheit) {
  return (tempInFahrenheit - 32) * (5 / 9);
}

export function celsiusToFahrenheit(tempInCelsius) {
  return tempInCelsius * (9 / 5) + 32;
}

export function mmToInches(distInMm) {
  // 1 inch = 25.4 mm
  const multiplier = 1 / 25.4;
  return distInMm * multiplier;
}

export function kmhToMph(speedInKmh) {
  // 1 kmh = 0.621371 mph
  const multiplier = 0.621371;
  return speedInKmh * multiplier;
}
