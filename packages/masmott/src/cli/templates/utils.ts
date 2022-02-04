export const jsonStringify = (obj: unknown) => JSON.stringify(obj, undefined, 2);

export const capitalize = (s: string) => (s[0]?.toUpperCase() ?? '') + s.slice(1);
