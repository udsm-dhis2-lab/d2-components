export default function trimQuotes(input: string): string {
  let s = input.trim();

  while (s.length >= 2) {
    const first = s[0];
    const last = s[s.length - 1];
    if ((first === "'" || first === '"') && first === last) {
      s = s.slice(1, -1).trim();
    } else {
      break;
    }
  }
  return s;
}
