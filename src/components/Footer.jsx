const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/hans-t%C3%B6rnquist-01435254/",
    label: "LinkedIn",
    icon: "fa-linkedin",
  },
  {
    href: "https://twitter.com/hanstornquist",
    label: "Twitter",
    icon: "fa-twitter",
  },
];

function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white py-6 font-mono z-50 flex-none">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm uppercase tracking-wider text-gray-500 hover:text-skillshot hover:underline decoration-2 underline-offset-4"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400">
            SkillShot AB © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
