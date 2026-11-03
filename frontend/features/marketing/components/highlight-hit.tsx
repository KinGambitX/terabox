export function HighlightHit({
  text,
  hit,
  className,
}: {
  text: string;
  hit: string;
  className: string;
}) {
  const start = text.indexOf(hit);
  if (start < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, start)}
      <mark className={`rounded px-0.5 ${className}`}>{hit}</mark>
      {text.slice(start + hit.length)}
    </>
  );
}
