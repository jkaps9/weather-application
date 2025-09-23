export class LocalStorage {
  constructor() {
    this.savedLocationArray = this.getFavoriteLocations();
  }

  localStorageCheck() {
    return typeof Storage !== "undefined";
  }

  saveLocation(location) {
    if (!this.isLocationSaved) {
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
      return `${location.name} ${location.country} saved successfully`;
    } else {
      return `${location.name} ${location.country} is already saved`;
    }
  }

  getFavoriteLocations() {
    const favoriteLocations = JSON.parse(
      localStorage.getItem("savedLocations")
    );
    if (favoriteLocations) return favoriteLocations;
    else return [];
  }

  isLocationSaved(location) {
    const locArray = this.getFavoriteLocations();
    locArray.forEach((loc) => {
      if (
        location.name === loc.name &&
        location.admin1 === loc.admin1 &&
        location.country === loc.country
      ) {
        return true;
      }
    });

    return false;
  }
}
