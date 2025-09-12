export class ReverseGeocodingAPI {
  constructor(API_KEY) {
    this.API_KEY = API_KEY;
    this.baseURL = "https://api.geoapify.com/v1/geocode/reverse";
  }

  async getLocation(lat, lon) {
    fetch(`${this.baseURL}?lat=${lat}&lon=${lon}&apiKey=${this.API_KEY}`)
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }
}
