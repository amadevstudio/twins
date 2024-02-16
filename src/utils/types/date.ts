export function isValidDate(d: Date) {
  return d.toString() !== "Invalid Date";
}

export function showDate(d: Date | undefined) {
  if (d === undefined || !isValidDate(d)) return undefined;

  const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate().toString();
  const month =
    d.getMonth() < 10 ? `0${d.getMonth() + 1}` : (d.getMonth() + 1).toString();
  return isValidDate(d) ? `${day}.${month}.${d.getFullYear()}` : undefined;
}

export function addictWithDots(date: string, deleteFlag: boolean) {
  return deleteFlag
    ? date
    : /^[0-9]{2}$/.test(date)
      ? date + "."
      : /^[0-9]{2}\.[0-9]{2}$/.test(date)
        ? date + "."
        : date;
}

export function onKeyDownDotsController(key: string) {
  if (key == ".") {
    return { stop: true, setDeleteFlag: false };
  } else if (key == "Backspace") {
    // || event.key == "Delete") {
    return { stop: false, setDeleteFlag: true };
  } else {
    return { stop: false, setDeleteFlag: false };
  }
}

export function isDateBad(date: Date) {
  return date > new Date() || date < new Date("1900-01-01");
}
