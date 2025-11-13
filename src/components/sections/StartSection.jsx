function StartSection({ data }) {
  return (
    <section>
      <h2>{data.heading}</h2>
      <h4>{data.preamble}</h4>
      <p dangerouslySetInnerHTML={{ __html: data.mainBody }} />
    </section>
  );
}

export default StartSection;
