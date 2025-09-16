export class LocalStorage {
  constructor() {}

  localStorageCheck() {
    return typeof Storage !== "undefined";
  }

  saveLocation(location) {
    for (let key in location) {
      localStorage.setItem(key, location[key]);
    }
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
}
