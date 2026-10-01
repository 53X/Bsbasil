export function restockItemLabel(title: string, selection: string): string {
  const name = title.trim();
  const detail = selection.trim();
  return detail ? `${name} (${detail})` : name;
}

export function ownerRestockMessage(input: { email: string; title: string; selection: string }): string {
  const item = restockItemLabel(input.title, input.selection);
  return `${input.email} wants ${item}. It is sold out right now.`;
}

export function customerRestockMessage(input: { title: string; selection: string; url: string }): string {
  const item = restockItemLabel(input.title, input.selection);
  return `${item} is back in stock.\n${input.url}`;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
