export function TextBlock({ content }: { content: string | null }) {
  if (!content) return null;
  const paragraphs = content.split('\n').filter((p) => p.trim());
  return (
    <div className="reading-content">
      {paragraphs.map((p, i) => {
        const trimmed = p.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i}>{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={i}>{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith('> ')) {
          return <blockquote key={i}>{trimmed.slice(2)}</blockquote>;
        }
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}
