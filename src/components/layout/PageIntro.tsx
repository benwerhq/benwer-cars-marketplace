interface PageIntroProps {
  title: string;
  description?: string;
}

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
