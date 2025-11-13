const SOCIAL_LINKS = [
  {
    href: 'https://www.linkedin.com/in/hans-t%C3%B6rnquist-01435254/',
    label: 'LinkedIn',
    icon: 'fa-linkedin-square',
  },
  {
    href: 'https://twitter.com/hanstornquist',
    label: 'Twitter',
    icon: 'fa-twitter',
  },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="sixteen columns">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
              <i className={`fa ${link.icon} fa-3x`} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
