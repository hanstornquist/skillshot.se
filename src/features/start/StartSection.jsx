function StartSection({ data }) {
  const rawBody = data.mainBody || "";
  const paragraphs = rawBody
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  const blocks = paragraphs.length > 0 ? paragraphs : rawBody ? [rawBody] : [];
  const hasHtml = (text) => /<[^>]+>/.test(text);
  const status = data.statusSection || {};

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="mb-20 border-l-4 border-skillshot pl-8">
        <h2 className="mb-6 text-4xl font-black tracking-tighter text-black sm:text-6xl md:text-8xl uppercase break-words">
          {data.heading}
        </h2>
        <h3 className="max-w-2xl text-2xl font-light leading-tight text-gray-800 sm:text-3xl font-mono">
          {data.preamble}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-12">
        <div className="sm:col-span-8 prose prose-lg prose-neutral max-w-none text-gray-800 prose-headings:font-bold prose-a:text-skillshot prose-a:no-underline hover:prose-a:underline font-sans">
          {blocks.map((text, index) =>
            hasHtml(text) ? (
              <div
                key={`${index}-html`}
                dangerouslySetInnerHTML={{ __html: text }}
                className="mb-6"
              />
            ) : (
              <p
                key={`${index}-${text.slice(0, 20)}`}
                className="mb-6 leading-relaxed"
              >
                {text}
              </p>
            )
          )}
        </div>
        <div className="sm:col-span-4 border-t-2 border-black pt-8 sm:border-t-0 sm:border-l-2 sm:pt-0 sm:pl-8">
          <div className="grid grid-cols-1 gap-8 font-mono text-sm">
            {/* Status Block */}
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                {status.systemStatusLabel}
              </div>
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skillshot opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-skillshot"></span>
                </span>
                <span className="font-bold uppercase tracking-wider">
                  {status.systemStatusValue}
                </span>
              </div>
            </div>

            {/* Availability Block */}
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                {status.availabilityLabel}
              </div>
              <div className="font-bold uppercase tracking-wider">
                {status.availabilityValue}
              </div>
            </div>

            {/* Location Block */}
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                {status.locationLabel}
              </div>
              <div className="font-bold uppercase tracking-wider">
                {status.locationValue}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StartSection;
