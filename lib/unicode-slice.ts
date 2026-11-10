export function unicodeSlice(text: string, start: number, end: number): string {
  return Array.from(text).slice(start, end).join("");
}

export function hasUsableOffset(value: unknown, start: unknown, end: unknown): start is number {
  return value !== null && Number.isInteger(start) && Number.isInteger(end) && typeof start === "number" && typeof end === "number" && end >= start;
}
