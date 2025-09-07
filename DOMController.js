export class DOMController {
  #weatherInfoCard = document.querySelector(".weather-info");
  #locationText = document.querySelector(".weather-info .location");
  #dateText = document.querySelector(".weather-info .date");

  constructor() {
    this.location = null;
    this.weather = null;
  }

  setLocation(loc) {
    this.location = loc;
    this.#setLocationText();
  }

  #setLocationText() {
    if (location) {
      this.#locationText.textContent = `${this.location.name}, ${this.location.country}`;
    } else {
      console.log("location not set");
    }
  }
}
