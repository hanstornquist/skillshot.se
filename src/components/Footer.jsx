import socialLinks from "../settings/social.json";

function Footer({ globalData }) {
  const { copyright, opensInNewTab } = globalData?.footer || {
    copyright: "SkillShot AB ©",
    opensInNewTab: "(opens in new tab)",
  };

  return (
    <footer className="border-t-2 border-black dark:border-gray-700 bg-white dark:bg-gray-900 py-6 font-mono z-50 flex-none transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label} ${opensInNewTab}`}
                className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-skillshot dark:hover:text-skillshot hover:underline decoration-2 underline-offset-4"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-600">
            {copyright} {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
