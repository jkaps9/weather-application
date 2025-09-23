export class LocalStorage {
  constructor() {
    this.savedLocationArray = this.getFavoriteLocations();
  }

  localStorageCheck() {
    return typeof Storage !== "undefined";
  }

  saveLocation(location) {
    const newLoc = {
      name: location.name,
      admin1: location.admin1,
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
