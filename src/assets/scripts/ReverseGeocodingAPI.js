export class ReverseGeocodingAPI {
  constructor(API_KEY) {
    this.API_KEY = API_KEY;
    this.baseURL = "https://api.geoapify.com/v1/geocode/reverse";
  }

  async getLocation(lat, lon) {
    try {
      const response = await fetch(
        `${this.baseURL}?lat=${lat}&lon=${lon}&apiKey=${this.API_KEY}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return {
          city: data.features[0].properties.city,
          country_code: data.features[0].properties.country_code,
        };
      } else {
        return;
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  }
}
