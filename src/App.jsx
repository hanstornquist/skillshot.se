import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import StartSection from './components/sections/StartSection.jsx';
import CvSection from './components/sections/CvSection.jsx';
import startData from '../pages/start.json';
import cvData from '../pages/cv.json';

const COMPONENT_MAP = {
  start: StartSection,
  cv: CvSection,
};

function App() {
  const pageConfig = useMemo(() => {
    const pages = [startData, cvData].map((data) => ({
      id: data.id,
      data,
      component: COMPONENT_MAP[data.id] ?? StartSection,
    }));
    return pages.filter((page) => page.id);
  }, []);

  const tabs = useMemo(
    () =>
      pageConfig
        .filter((page) => page.data?.showInMenu)
        .map((page) => ({
          id: page.id,
          label: page.data?.menuName || page.id,
        })),
    [pageConfig],
  );

  const defaultTab = tabs[0]?.id || pageConfig[0]?.id || '';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const isValidTab = useMemo(() => {
    const lookup = new Set(pageConfig.map((page) => page.id));
    return (candidate) => lookup.has(candidate);
  }, [pageConfig]);

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
    const page = pageConfig.find((item) => item.id === activeTab) || pageConfig[0];
    if (!page) {
      return null;
    }
    const SectionComponent = page.component;
    return <SectionComponent data={page.data} />;
  };

  return (
    <>
      <Header tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
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
