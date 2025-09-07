export class DOMController {
  weatherInfoCard = document.querySelector(".weather-info");
  locationText = weatherInfo.querySelector(".location");
  dateText = weatherInfo.querySelector(".date");

  constructor() {
    this.location = null;
    this.weather = null;
  }

  setLocationText() {
    if (location) {
      this.locationText.textContent = `${this.location.name}, ${this.location.country}`;
    } else {
      console.log("location not set");
    }
  }
}
