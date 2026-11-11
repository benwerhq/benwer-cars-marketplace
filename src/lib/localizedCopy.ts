export function localizedText(
  record: Record<string, string> | null | undefined,
  locale: string,
  fallback = "",
): string {
  if (!record) {
    return fallback;
  }

  const language = locale.slice(0, 2);
  return (
    record[locale] ??
    record[language] ??
    record["en-GB"] ??
    record.en ??
    Object.values(record).find((value) => value.trim()) ??
    fallback
  );
}
