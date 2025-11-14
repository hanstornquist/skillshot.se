const baseUrl = import.meta.env.BASE_URL || '/';
const logoSrc = `${baseUrl}images/SkillShot.png`;

const HEADER_STYLES = `
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .header-logo-wrapper {
    flex: 1 1 240px;
    display: flex;
    justify-content: flex-start;
  }

  .nav-wrapper {
    flex: 1 1 auto;
  }

  .header-logo {
    display: inline-flex;
    max-width: 240px;
    width: 100%;
    height: auto;
    margin: 30px 0;
  }

  @media (max-width: 600px) {
    .header-inner {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .header-logo-wrapper {
      justify-content: center;
    }

    .header-logo {
      max-width: 180px;
      justify-content: center;
    }

    .nav-wrapper {
      width: 100%;
      text-align: left;
    }
  }
`;

function Header({ tabs, activeTab, onTabChange }) {
  return (
    <header className="sixteen columns head">
      <style>{HEADER_STYLES}</style>
      <div className="container">
        <div className="sixteen columns header-inner">
          <div className="header-logo-wrapper">
            <img className="header-logo" src={logoSrc} alt="SkillShot logo" />
          </div>
          <div className="nav-wrapper">
            <nav aria-label="Primary">
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
      </div>
    </header>
  );
}

export default Header;
