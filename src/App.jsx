import { useEffect, useMemo, useState, useRef } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MetaManager from "./components/MetaManager.jsx";
import StartSection from "./features/start/StartSection.jsx";
import CvSection from "./features/cv/CvSection.jsx";
import DxfSection from "./features/dxf/DxfSection.jsx";
import LabsSection from "./features/labs/LabsSection.jsx";
import EjectionChargeCalculator from "./features/labs/EjectionChargeCalculator.jsx";
import startData from "./features/start/start.json";
import cvData from "./features/cv/cv.json";
import dxfData from "./features/dxf/dxf.json";
import labsData from "./features/labs/labs.json";
import ejectionData from "./features/labs/ejection.json";
import globalData from "./features/global.json";

const COMPONENT_MAP = {
  start: StartSection,
  cv: CvSection,
  dxf: DxfSection,
  labs: LabsSection,
  ejection: EjectionChargeCalculator,
};

// Build parent map from data to support hierarchical routing
const PARENT_MAP = {};
labsData.links?.forEach((link) => {
  PARENT_MAP[link.id] = labsData.id;
});

const getPathForId = (id) => {
  if (id === startData.id) return "/";
  if (PARENT_MAP[id]) return `/${PARENT_MAP[id]}/${id}`;
  return `/${id}`;
};

function App() {
  // Re-create pageConfig on every render to support HMR updates
  const pageConfig = [startData, cvData, labsData, dxfData, ejectionData]
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

  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      setIsScrolled(mainElement.scrollTop > 0);
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    // Handle root path
    if (path === "/" || path === "") return startData.id;

    // Extract the last segment of the path as the ID
    // e.g. /labs/dxf -> dxf, /cv -> cv
    const parts = path.split("/").filter(Boolean);
    const candidateId = parts[parts.length - 1];

    const validIds = new Set([
      startData.id,
      cvData.id,
      dxfData.id,
      labsData.id,
      ejectionData.id,
    ]);
    return validIds.has(candidateId)
      ? candidateId
      : tabs[0]?.id || startData.id;
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
      const path = window.location.pathname;
      if (path === "/" || path === "") return defaultTab;
      const parts = path.split("/").filter(Boolean);
      return parts[parts.length - 1] || defaultTab;
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
    const currentPath = window.location.pathname;
    const newPath = getPathForId(activeTab);

    // Only push state if the path is actually different
    // This prevents replacing /labs/dxf with /dxf if we had simple logic before
    if (currentPath !== newPath) {
      window.history.pushState(null, "", newPath);
    }

    // Scroll to top when tab changes
    if (mainRef.current) {
      // Use setTimeout to ensure render is complete and layout is updated
      window.setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 0);
    }
  }, [activeTab, defaultTab]);

  useEffect(() => {
    const page = pageConfig.find((item) => item.id === activeTab);
    console.log("Theme update:", {
      activeTab,
      pageId: page?.id,
      isDarkMode: page?.data?.isDarkMode,
    });

    if (page?.data?.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [activeTab, pageConfig]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) {
      // If clicking the same tab, just scroll to top
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setActiveTab(tabId);
    }
  };

  const renderActiveSection = () => {
    const page =
      pageConfig.find((item) => item.id === activeTab) || pageConfig[0];
    if (!page) {
      return null;
    }
    const SectionComponent = page.component;
    return (
      <SectionComponent
        data={page.data}
        globalData={globalData}
        onNavigate={handleTabChange}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <MetaManager
        activeTab={activeTab}
        pageConfig={pageConfig}
        globalData={globalData}
      />
      <Header
        tabs={tabs}
        activeTab={PARENT_MAP[activeTab] || activeTab}
        onTabChange={handleTabChange}
        isScrolled={isScrolled}
      />
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4">
          <div className="w-full">{renderActiveSection()}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
