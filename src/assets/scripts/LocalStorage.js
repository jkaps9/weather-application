export class LocalStorage {
  constructor() {
    this.savedLocationArray = this.getFavoriteLocations();
    console.log(this.savedLocationArray);
  }

  localStorageCheck() {
    return typeof Storage !== "undefined";
  }

  getSavedLocation() {
    if (localStorage.length <= 0) {
      return;
    } else {
      return {
        name: localStorage.getItem("name"),
        country: localStorage.getItem("country"),
        latitude: Number(localStorage.getItem("latitude")),
        longitude: Number(localStorage.getItem("longitude")),
      };
    }
  }

  saveLocation(location) {
    const newLoc = {
      name: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    };
    this.savedLocationArray.push(newLoc);
    localStorage.setItem(
      "savedLocations",
      JSON.stringify(this.savedLocationArray)
    );
  }

  getFavoriteLocations() {
    const favoriteLocations = JSON.parse(
      localStorage.getItem("savedLocations")
    );
    if (favoriteLocations) return favoriteLocations;
    else return [];
  }
}
