export function processKeyWordsString(keyWordsString: string) {
  return keyWordsString
    .replace(/^\s+|\s+$/g, "") // Remove spaces from start and end
    .replace(/[^а-яА-Яa-zA-Z0-9 ]/g, "") // Remove all but not in range
    .split(" ")
    .filter((kw) => kw.length > 0)
    .map((kw) => kw.toLowerCase());
}
