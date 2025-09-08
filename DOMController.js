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
    if (this.location) {
      this.#locationText.textContent = `${this.location.name}, ${this.location.country}`;
    } else {
      console.log("location not set");
    }
  }

  setWeather(weath) {
    this.weather = weath;
    this.#setDateText();
  }

  #setDateText() {
    if (this.weather) {
      const date = this.#formatDate(this.weather.current.time);
      this.#dateText.textContent = `${date}`;
    } else {
      console.log("weather not set");
    }
  }

  #formatDate(dt) {
    const date = new Date(dt);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);

    return formatter.format(date);
  }
}
