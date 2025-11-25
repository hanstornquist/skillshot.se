import { useEffect } from "react";

const GoogleAnalytics = ({ trackingId }) => {
  useEffect(() => {
    if (!trackingId || trackingId === "G-XXXXXXXXXX") return;

    // Load the script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", trackingId);

    return () => {
      // Cleanup if needed (though GA scripts usually persist)
      document.head.removeChild(script);
    };
  }, [trackingId]);

  return null;
};

export default GoogleAnalytics;
