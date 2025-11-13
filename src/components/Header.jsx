function Header({ tabs, activeTab, onTabChange }) {
  return (
    <header className="sixteen columns head">
      <div className="container">
        <div className="sixteen columns">
          <h1>Hans Törnquist</h1>
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
    </header>
  );
}

export default Header;
