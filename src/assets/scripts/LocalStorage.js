function localStorageCheck() {
  return typeof Storage !== "undefined";
}

export function storeLocation(location) {
  for (let key in location) {
    localStorage.setItem(key, location[key]);
  }
}

export function getLocation() {
  return {
    city: localStorage.getItem("city"),
    country: localStorage.getItem("country"),
    latitude: localStorage.getItem("latitude"),
    longitude: localStorage.getItem("longitude"),
  };
}
