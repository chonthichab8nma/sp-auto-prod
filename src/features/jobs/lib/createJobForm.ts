export function parseFieldValue(name: string, value: string) {
  if (name === "excessFee" || name === "claimAmount") return value === "" ? 0 : Number(value);
  return value;
}

export function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export function buildYearOptions() {
  const now = new Date().getFullYear();
  const years: string[] = [];
  for (let y = now; y >= now - 40; y--) years.push(String(y));
  return years;
}

export function parseInsuranceOption(v: string) {
  const [idStr, ...rest] = v.split("::");
  return { id: Number(idStr), name: rest.join("::") };
}
