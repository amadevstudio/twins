export function localSetItem(key: string, value: string) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
  }
}

export function localGetItem(key: string) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  } else {
    return null;
  }
}
