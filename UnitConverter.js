export function fahrenheitToCelsius(tempInFahrenheit) {
  return (tempInFahrenheit - 32) * (5 / 9);
}

export function celsiusToFahrenheit(tempInCelsius) {
  return tempInCelsius * (9 / 5) + 32;
}
