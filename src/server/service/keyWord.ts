export function processKeyWordsString(keyWordsString: string) {
  return keyWordsString
    .replace(/^\s+|\s+$/g, "") // Remove spaces from start and end
    .split(" ")
    .filter((kw) => kw.length > 0)
    .map((kw) => kw.toLowerCase());
}
