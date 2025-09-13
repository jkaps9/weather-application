function localStorageCheck() {
  return typeof Storage !== "undefined";
}

export function storeLocation(location) {
  for (let key in location) {
    localStorage.setItem(key, location[key]);
  }
}

export function getLocation() {
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
