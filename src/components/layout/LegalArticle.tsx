interface LegalSection {
  title: string;
  body: string;
}

interface LegalArticleProps {
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalArticle({
  title,
  lede,
  updated,
  sections,
}: LegalArticleProps) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{updated}</p>
        {lede ? (
          <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </header>
      {sections.map((section, index) => (
        <section key={`${index}-${section.title}`} className="flex flex-col gap-2">
          {section.title ? (
            <h2 className="text-xl font-semibold text-foreground">
              {section.title}
            </h2>
          ) : null}
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {section.body}
          </p>
        </section>
      ))}
    </article>
  );
}
