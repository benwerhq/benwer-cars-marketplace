export interface LegalSection {
  title: string;
  body: string;
}

export function readLegalSections(value: unknown): LegalSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as { title?: unknown; body?: unknown };
    if (typeof record.title !== "string" || typeof record.body !== "string") {
      return [];
    }

    const title = record.title.trim();
    const body = record.body.trim();
    if (!title || !body) {
      return [];
    }

    return [{ title, body }];
  });
}

const TITLE_PREFIX = "# ";

export interface LegalText {
  title: string;
  body: string;
}

export function splitLegalText(text: string): LegalText {
  const trimmed = text.replace(/^\s+/, "");
  if (!trimmed.startsWith(TITLE_PREFIX)) {
    return { title: "", body: text.trim() };
  }
  const newline = trimmed.indexOf("\n");
  const firstLine = newline === -1 ? trimmed : trimmed.slice(0, newline);
  return {
    title: firstLine.slice(TITLE_PREFIX.length).trim(),
    body: newline === -1 ? "" : trimmed.slice(newline + 1).trim(),
  };
}

export function joinLegalText({ title, body }: LegalText): string {
  const cleanTitle = title.trim();
  return cleanTitle ? `${TITLE_PREFIX}${cleanTitle}\n\n${body}`.trimEnd() : body;
}

export function splitLegalCopy(copy: Record<string, string>): {
  title: Record<string, string>;
  body: Record<string, string>;
} {
  const title: Record<string, string> = {};
  const body: Record<string, string> = {};
  for (const [locale, text] of Object.entries(copy)) {
    const parts = splitLegalText(text);
    if (parts.title) title[locale] = parts.title;
    if (parts.body) body[locale] = parts.body;
  }
  return { title, body };
}

export function joinLegalCopy(
  title: Record<string, string>,
  body: Record<string, string>,
): Record<string, string> {
  const joined: Record<string, string> = {};
  for (const locale of new Set([...Object.keys(title), ...Object.keys(body)])) {
    const text = joinLegalText({ title: title[locale] ?? "", body: body[locale] ?? "" });
    if (text) joined[locale] = text;
  }
  return joined;
}

const SECTION_PREFIX = "## ";

export interface LegalBlocks {
  intro: string;
  sections: LegalSection[];
}

export function parseLegalBlocks(body: string): LegalBlocks {
  const blocks: LegalBlocks = { intro: "", sections: [] };
  const intro: string[] = [];
  let current: { title: string; lines: string[] } | null = null;
  const flush = () => {
    if (current) {
      blocks.sections.push({ title: current.title, body: current.lines.join("\n").trim() });
    }
  };

  for (const line of body.split("\n")) {
    if (line.startsWith(SECTION_PREFIX.trimEnd())) {
      flush();
      current = { title: line.replace(/^##\s?/, "").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  flush();
  blocks.intro = intro.join("\n").trim();
  return blocks;
}

export function serializeLegalBlocks({ intro, sections }: LegalBlocks): string {
  return [
    intro.trim(),
    ...sections.map((section) =>
      `${SECTION_PREFIX}${section.title.trim()}\n${section.body.trim()}`.trim(),
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function legalTemplateText(lede: string, sections: LegalSection[]): string {
  return serializeLegalBlocks({ intro: lede, sections });
}
