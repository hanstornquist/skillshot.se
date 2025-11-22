import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import StartSection from "./features/start/StartSection.jsx";
import CvSection from "./features/cv/CvSection.jsx";
import DxfSection from "./features/dxf/DxfSection.jsx";
import startData from "./features/start/start.json";
import cvData from "./features/cv/cv.json";
import dxfData from "./features/dxf/dxf.json";

const COMPONENT_MAP = {
  start: StartSection,
  cv: CvSection,
  dxf: DxfSection,
};

function App() {
  const pageConfig = useMemo(() => {
    const pages = [startData, cvData, dxfData].map((data) => ({
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
    [pageConfig]
  );

  const defaultTab = tabs[0]?.id || pageConfig[0]?.id || "";

  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.substring(1);
    const validIds = new Set([startData.id, cvData.id, dxfData.id]);
    return validIds.has(path) ? path : tabs[0]?.id || startData.id;
  });

  const isValidTab = useMemo(() => {
    const lookup = new Set(pageConfig.map((page) => page.id));
    return (candidate) => lookup.has(candidate);
  }, [pageConfig]);

  useEffect(() => {
    const getTabFromPath = () => {
      const path = window.location.pathname.substring(1); // Remove leading slash
      return path || defaultTab;
    };

    const current = getTabFromPath();
    if (isValidTab(current)) {
      setActiveTab(current);
    }

    const handlePopState = () => {
      const next = getTabFromPath();
      if (isValidTab(next)) {
        setActiveTab(next);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isValidTab, defaultTab]);

  useEffect(() => {
    const path = window.location.pathname.substring(1);
    if (activeTab !== path && !(activeTab === defaultTab && path === "")) {
      const newPath = activeTab === defaultTab ? "/" : `/${activeTab}`;
      window.history.pushState(null, "", newPath);
    }
  }, [activeTab, defaultTab]);

  const renderActiveSection = () => {
    const page =
      pageConfig.find((item) => item.id === activeTab) || pageConfig[0];
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
