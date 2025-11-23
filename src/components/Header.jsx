const baseUrl = import.meta.env.BASE_URL || "/";
const logoSrc = `${baseUrl}images/SkillShot.png`;

function Header({ tabs, activeTab, onTabChange, isScrolled }) {
  return (
    <header className="w-full border-b-2 border-black bg-white z-50 flex-none">
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
                alt="SkillShot logo"
              />
            </a>
          </div>
          <nav aria-label="Primary">
            <ul className="flex flex-wrap justify-center gap-1 sm:justify-end font-mono text-sm uppercase tracking-wider">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <a
                    href={`#${tab.id}`}
                    className={`block px-4 py-2 transition-all ${
                      tab.id === activeTab
                        ? "bg-black text-white font-bold"
                        : "text-gray-500 hover:text-black hover:bg-gray-100"
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
