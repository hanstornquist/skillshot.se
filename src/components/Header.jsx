const baseUrl = import.meta.env.BASE_URL || '/';
const logoSrc = `${baseUrl}images/SkillShot.png`;

function Header({ tabs, activeTab, onTabChange }) {
  return (
    <header className="sixteen columns head">
      <div className="container">
        <div className="sixteen columns header-inner">
          <div className="header-logo-wrapper">
            <img className="header-logo" src={logoSrc} alt="SkillShot logo" />
          </div>
          <nav aria-label="Primary" className="header-nav">
            <ul id="menu" className="tabs">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <a
                    href={`#${tab.id}`}
                    className={tab.id === activeTab ? 'active' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      onTabChange(tab.id);
                    }}
                  >
                    {tab.label}
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
