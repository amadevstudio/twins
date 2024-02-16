export function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res: { [K in T]: K }, key) => {
    res[key] = key;
    return res;
  }, Object.create(null) as { [K in T]: K });
}
