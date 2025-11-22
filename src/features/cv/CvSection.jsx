function CvSection({ data }) {
  const { project, employment, education, special } = data;

  return (
    <section>
      <h2>{data.heading}</h2>
      {data.preamble ? <p className="ingress">{data.preamble}</p> : null}
      {data.mainBody ? <p>{data.mainBody}</p> : null}

      {project && (
        <>
          <h3>{project.heading}</h3>
          {project.projects
            ?.filter((proj) => proj.published)
            .map((proj) => (
              <div key={proj.heading}>
                <a href={proj.href} target="_blank" rel="noreferrer">
                  <h4>{proj.heading}</h4>
                </a>
                <p>{proj.preamble}</p>
                {proj.tools?.length ? (
                  <>
                    <h5>Tools</h5>
                    <ul>
                      {proj.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {proj.footer ? <p>{proj.footer}</p> : null}
              </div>
            ))}
        </>
      )}

      {employment && (
        <>
          <h3>{employment.heading}</h3>
          {employment.employments?.map((item) => (
            <div key={`${item.heading}-${item.date}`}>
              <h4>{item.date}</h4>
              <p className="ingress">{item.heading}</p>
              {item.preamble ? <p>{item.preamble}</p> : null}
            </div>
          ))}
        </>
      )}

      {education && (
        <>
          <h3>{education.heading}</h3>
          {education.educations?.map((item) => (
            <div key={`${item.heading}-${item.date}`}>
              <h4>{item.date}</h4>
              <p className="ingress">{item.heading}</p>
              {item.preamble ? <p>{item.preamble}</p> : null}
            </div>
          ))}
        </>
      )}

      {special && (
        <>
          <h3>{special.heading}</h3>
          <ul>
            {special.specials?.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default CvSection;
