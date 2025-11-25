const baseUrl = import.meta.env.BASE_URL || "/";
const logoSrc = `${baseUrl}images/SkillShot.png`;

function Header({ tabs, activeTab, onTabChange, isScrolled, globalData }) {
  const { logoAlt, navLabel } = globalData?.header || {
    logoAlt: "SkillShot logo",
    navLabel: "Primary",
  };

  return (
    <header className="w-full border-b-2 border-black dark:border-gray-700 bg-white dark:bg-gray-900 z-50 flex-none transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between py-6 sm:flex-row">
          <div className="mb-6 sm:mb-0">
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                onTabChange("start");
              }}
              className="block group"
            >
              <img
                className={`h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0 ${
                  isScrolled ? "grayscale" : ""
                }`}
                src={logoSrc}
                alt={logoAlt}
              />
            </a>
          </div>
          <nav aria-label={navLabel}>
            <ul className="flex flex-wrap justify-center gap-1 sm:justify-end font-mono text-sm uppercase tracking-wider">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <a
                    href={`#${tab.id}`}
                    aria-current={tab.id === activeTab ? "page" : undefined}
                    className={`block px-4 py-2 transition-all ${
                      tab.id === activeTab
                        ? "bg-black text-white font-bold dark:bg-white dark:text-black"
                        : "text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      onTabChange(tab.id);
                    }}
                  >
                    {tab.id === activeTab ? `[ ${tab.label} ]` : tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
