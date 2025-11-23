import { useEffect, useMemo, useState, useRef } from "react";
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
  // Re-create pageConfig on every render to support HMR updates
  const pageConfig = [startData, cvData, dxfData]
    .map((data) => ({
      id: data.id,
      data,
      component: COMPONENT_MAP[data.id] ?? StartSection,
    }))
    .filter((page) => page.id);

  // Memoize tabs based on pageConfig structure (JSON content changes won't break this unless structure changes)
  const tabs = useMemo(
    () =>
      pageConfig
        .filter((page) => page.data?.showInMenu)
        .map((page) => ({
          id: page.id,
          label: page.data?.menuName || page.id,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(pageConfig.map((p) => p.id + p.data?.menuName))]
  );

  const defaultTab = tabs[0]?.id || pageConfig[0]?.id || "";

  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.substring(1);
    const validIds = new Set([startData.id, cvData.id, dxfData.id]);
    return validIds.has(path) ? path : tabs[0]?.id || startData.id;
  });

  // Stable lookup function
  const isValidTab = useMemo(() => {
    const lookup = new Set(pageConfig.map((page) => page.id));
    return (candidate) => lookup.has(candidate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pageConfig.map((p) => p.id))]);

  // Use a ref to access the latest isValidTab in the effect without triggering re-runs
  const isValidTabRef = useRef(isValidTab);
  useEffect(() => {
    isValidTabRef.current = isValidTab;
  }, [isValidTab]);

  useEffect(() => {
    const getTabFromPath = () => {
      const path = window.location.pathname.substring(1);
      return path || defaultTab;
    };

    // Only set active tab if it's actually different to avoid loops
    const current = getTabFromPath();
    if (isValidTabRef.current(current)) {
      setActiveTab((prev) => (prev !== current ? current : prev));
    }

    const handlePopState = () => {
      const next = getTabFromPath();
      if (isValidTabRef.current(next)) {
        setActiveTab(next);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [defaultTab]); // Removed isValidTab from dependencies

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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="container mx-auto px-4">
          <div className="w-full">{renderActiveSection()}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
