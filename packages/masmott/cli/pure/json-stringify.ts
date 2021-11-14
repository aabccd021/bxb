export function jsonStringify(object: unknown): string {
  return JSON.stringify(object, undefined, 2);
}
