import { useState, useEffect } from "react";

function CvSection({ data, globalData }) {
  const { project, employment, education, special } = data;
  const [activeSection, setActiveSection] = useState("");
  const contentsLabel = globalData?.cv?.contentsLabel || "Contents";

  useEffect(() => {
    let observer;

    const initObserver = () => {
      if (observer) observer.disconnect();

      const bottomMargin = Math.max(0, window.innerHeight - 212);
      const observerOptions = {
        root: null,
        rootMargin: `-162px 0px -${bottomMargin}px 0px`,
        threshold: 0,
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      }, observerOptions);

      const sections = ["projects", "employment", "education", "special"];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      if (project?.projects) {
        project.projects.forEach((p) => {
          if (p.published) {
            const id = `proj-${p.heading
              .replace(/\s+/g, "-")
              .toLowerCase()}-${p.startDate
              ?.replace(/[^a-z0-9]/gi, "-")
              .toLowerCase()}`;
            const el = document.getElementById(id);
            if (el) observer.observe(el);
          }
        });
      }
    };

    initObserver();

    const handleResize = () => {
      initObserver();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [project, employment, education, special]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      {/* Header */}
      <div className="mb-20 border-l-4 border-skillshot pl-8">
        <h2 className="mb-6 text-4xl font-black tracking-tighter text-black sm:text-6xl md:text-8xl uppercase break-words">
          {data.heading}
        </h2>
        {data.preamble && (
          <p className="max-w-2xl text-2xl font-light leading-tight text-gray-800 sm:text-3xl font-mono">
            {data.preamble}
          </p>
        )}
        {data.mainBody && (
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-600 font-sans">
            {data.mainBody}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-12">
        {/* Sidebar (Mirrored: Left side) */}
        <div className="sm:col-span-4 border-b-2 border-black pb-8 sm:border-b-0 sm:border-r-2 sm:pb-0 sm:pr-8">
          <div className="sticky top-8">
            <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
              {contentsLabel}
            </div>
            <nav className="space-y-6">
              {/* Projects Links */}
              {project && (
                <div>
                  <button
                    onClick={() => scrollTo("projects")}
                    className={`font-bold uppercase tracking-tight block mb-2 text-sm text-left ${
                      activeSection === "projects" ||
                      activeSection.startsWith("proj-")
                        ? "text-skillshot"
                        : "text-black hover:text-skillshot"
                    }`}
                  >
                    {project.heading}
                  </button>
                  <ul className="space-y-1 pl-2 border-l border-gray-200">
                    {project.projects
                      ?.filter((p) => p.published)
                      .map((p) => {
                        const id = `proj-${p.heading
                          .replace(/\s+/g, "-")
                          .toLowerCase()}-${p.startDate
                          ?.replace(/[^a-z0-9]/gi, "-")
                          .toLowerCase()}`;
                        return (
                          <li key={id}>
                            <button
                              onClick={() => scrollTo(id)}
                              className={`text-xs text-left block py-0.5 truncate w-full transition-colors ${
                                activeSection === id
                                  ? "text-skillshot font-bold"
                                  : "text-gray-500 hover:text-skillshot"
                              }`}
                            >
                              {p.heading}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
              {/* Other Links */}
              {employment && (
                <button
                  onClick={() => scrollTo("employment")}
                  className={`font-bold uppercase tracking-tight block text-sm text-left ${
                    activeSection === "employment"
                      ? "text-skillshot"
                      : "text-black hover:text-skillshot"
                  }`}
                >
                  {employment.heading}
                </button>
              )}
              {education && (
                <button
                  onClick={() => scrollTo("education")}
                  className={`font-bold uppercase tracking-tight block text-sm text-left ${
                    activeSection === "education"
                      ? "text-skillshot"
                      : "text-black hover:text-skillshot"
                  }`}
                >
                  {education.heading}
                </button>
              )}
              {special && (
                <button
                  onClick={() => scrollTo("special")}
                  className={`font-bold uppercase tracking-tight block text-sm text-left ${
                    activeSection === "special"
                      ? "text-skillshot"
                      : "text-black hover:text-skillshot"
                  }`}
                >
                  {special.heading}
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content (Mirrored: Right side) */}
        <div className="sm:col-span-8 space-y-24">
          {/* Projects Grid */}
          {project && (
            <div id="projects" className="scroll-mt-20">
              <h3 className="sticky top-0 z-10 bg-[#f5f5f5] py-4 text-2xl font-black uppercase tracking-tighter border-b-2 border-black mb-10">
                {project.heading}
              </h3>
              <div className="grid gap-8 grid-cols-1">
                {project.projects
                  ?.filter((proj) => proj.published)
                  .map((proj) => {
                    const id = `proj-${proj.heading
                      .replace(/\s+/g, "-")
                      .toLowerCase()}-${proj.startDate
                      ?.replace(/[^a-z0-9]/gi, "-")
                      .toLowerCase()}`;
                    return (
                      <div
                        key={id}
                        id={id}
                        className="scroll-mt-24 group flex flex-col justify-between border-2 border-black bg-white p-6 transition-all hover:bg-orange-50 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <a
                          href={proj.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block h-full"
                        >
                          <div>
                            {(proj.startDate || proj.endDate) && (
                              <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 group-hover:text-skillshot transition-colors">
                                {proj.startDate}
                                {proj.endDate ? ` - ${proj.endDate}` : ""}
                              </span>
                            )}
                            <h4 className="mb-3 text-xl font-bold uppercase tracking-tight text-black group-hover:text-skillshot">
                              {proj.heading}
                            </h4>
                            <p className="mb-6 text-gray-600 leading-relaxed text-sm">
                              {proj.preamble}
                            </p>
                          </div>

                          {proj.tools?.length ? (
                            <div className="mt-auto">
                              <div className="flex flex-wrap gap-2">
                                {proj.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="font-mono text-xs border border-gray-300 px-2 py-1 text-gray-500 uppercase"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {proj.footer && (
                            <p className="mt-4 text-xs text-gray-400 font-mono">
                              {proj.footer}
                            </p>
                          )}
                        </a>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Employment Timeline */}
          {employment && (
            <div id="employment" className="scroll-mt-20">
              <h3 className="sticky top-0 z-10 bg-[#f5f5f5] py-4 text-2xl font-black uppercase tracking-tighter border-b-2 border-black mb-10">
                {employment.heading}
              </h3>
              <div className="space-y-12">
                {employment.employments?.map((item) => (
                  <div
                    key={`${item.heading}-${item.startDate}`}
                    className="grid grid-cols-1 gap-2 border-l-2 border-gray-200 pl-6 hover:border-skillshot transition-colors duration-300"
                  >
                    <div>
                      <span className="font-mono text-sm font-bold text-skillshot uppercase tracking-wider block mb-1">
                        {item.startDate}
                        {item.endDate ? ` - ${item.endDate}` : ""}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-black uppercase tracking-tight mb-2">
                        {item.heading}
                      </h5>
                      {item.preamble && (
                        <p className="text-gray-600 leading-relaxed">
                          {item.preamble}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Timeline */}
          {education && (
            <div id="education" className="scroll-mt-20">
              <h3 className="sticky top-0 z-10 bg-[#f5f5f5] py-4 text-2xl font-black uppercase tracking-tighter border-b-2 border-black mb-10">
                {education.heading}
              </h3>
              <div className="space-y-12">
                {education.educations?.map((item) => (
                  <div
                    key={`${item.heading}-${item.startDate}`}
                    className="grid grid-cols-1 gap-2 border-l-2 border-gray-200 pl-6 hover:border-black transition-colors duration-300"
                  >
                    <div>
                      <span className="font-mono text-sm font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        {item.startDate}
                        {item.endDate ? ` - ${item.endDate}` : ""}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-black uppercase tracking-tight mb-2">
                        {item.heading}
                      </h5>
                      {item.preamble && (
                        <p className="text-gray-600 leading-relaxed">
                          {item.preamble}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Skills */}
          {special && (
            <div
              id="special"
              className="scroll-mt-20 min-h-[calc(100vh-250px)]"
            >
              <div className="bg-gray-50 border-2 border-black p-8 sm:p-12">
                <h3 className="sticky top-0 z-10 bg-gray-50 py-4 mb-8 text-2xl font-black uppercase tracking-tighter text-black">
                  {special.heading}
                </h3>
                <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-1 lg:grid-cols-2">
                  {special.specials?.map((entry) => (
                    <li
                      key={entry}
                      className="flex items-center gap-3 text-gray-700 font-mono text-sm border-b border-gray-200 pb-2"
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 bg-skillshot" />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CvSection;
