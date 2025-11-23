import { useEffect } from "react";

const MetaManager = ({ activeTab, pageConfig, globalData }) => {
  useEffect(() => {
    const page = pageConfig.find((item) => item.id === activeTab);
    if (!page) return;

    const meta = page.data?.meta || {};
    const defaults = globalData.meta || {};

    const title = meta.title || defaults.siteName || "SkillShot AB";
    const description =
      meta.description ||
      "SkillShot AB - modern system development and architecture.";
    const image =
      meta.image || defaults.defaultImage || "/images/SkillShot.png";
    const url = window.location.href;
    const fullImageUrl = image.startsWith("http")
      ? image
      : `${window.location.origin}${image}`;

    // Update Title
    document.title = title;

    // Helper to update meta tag
    const updateMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (selector.includes("name=")) {
          element.setAttribute("name", selector.match(/name="([^"]+)"/)[1]);
        } else if (selector.includes("property=")) {
          element.setAttribute(
            "property",
            selector.match(/property="([^"]+)"/)[1]
          );
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    updateMeta('meta[name="description"]', "content", description);

    updateMeta('meta[property="og:title"]', "content", title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[property="og:image"]', "content", fullImageUrl);
    updateMeta('meta[property="og:url"]', "content", url);

    updateMeta('meta[property="twitter:title"]', "content", title);
    updateMeta('meta[property="twitter:description"]', "content", description);
    updateMeta('meta[property="twitter:image"]', "content", fullImageUrl);
    updateMeta('meta[property="twitter:url"]', "content", url);
  }, [activeTab, pageConfig, globalData]);

  return null; // This component doesn't render anything visible
};

export default MetaManager;
