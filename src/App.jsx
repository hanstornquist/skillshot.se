import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import StartSection from './components/sections/StartSection.jsx';
import CvSection from './components/sections/CvSection.jsx';
import startData from '../pages/start.json';
import cvData from '../pages/cv.json';

const TABS = [
  { id: 'start', label: 'Start' },
  { id: 'cv', label: 'CV' },
];

const DEFAULT_TAB = TABS[0].id;

function App() {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  const isValidTab = useMemo(() => {
    const lookup = new Set(TABS.map((tab) => tab.id));
    return (candidate) => lookup.has(candidate);
  }, []);

  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '');
    if (fromHash && isValidTab(fromHash)) {
      setActiveTab(fromHash);
    }

    const handleHashChange = () => {
      const next = window.location.hash.replace('#', '');
      if (next && isValidTab(next)) {
        setActiveTab(next);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isValidTab]);

  useEffect(() => {
    if (activeTab !== window.location.hash.replace('#', '')) {
      window.location.hash = `#${activeTab}`;
    }
  }, [activeTab]);

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'cv':
        return <CvSection heading={cvData.heading} data={cvData} />;
      case 'start':
      default:
        return <StartSection data={startData} />;
    }
  };

  return (
    <>
      <Header tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <article>
        <div className="container">
          <div className="sixteen columns" id="contentArea">
            {renderActiveSection()}
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}

export default App;
