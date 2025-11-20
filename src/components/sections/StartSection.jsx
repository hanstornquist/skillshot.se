function StartSection({ data }) {
  const rawBody = data.mainBody || "";
  const paragraphs = rawBody
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  const blocks = paragraphs.length > 0 ? paragraphs : rawBody ? [rawBody] : [];
  const hasHtml = (text) => /<[^>]+>/.test(text);

  return (
    <section>
      <h2>{data.heading}</h2>
      <h4>{data.preamble}</h4>
      {blocks.map((text, index) =>
        hasHtml(text) ? (
          <div
            key={`${index}-html`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ) : (
          <p key={`${index}-${text.slice(0, 20)}`}>{text}</p>
        )
      )}
    </section>
  );
}

export default StartSection;
