export function toSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}
