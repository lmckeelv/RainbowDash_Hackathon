import { useEffect, useState } from "react";
import EmailEditor from "./components/EmailEditor";
import LandingPage from "./Pages/LandingPage";
import PlaceholderPage from "./Pages/PlaceholderPage";
import SuccessStatusPage from "./Pages/SuccessStatusPage";

export default function App() {
  const [path, setPath] = useState(window.location.pathname || "/");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(nextPath) {
    if (nextPath === path) return;
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  let page;

  if (path === "/") {
    page = <LandingPage navigate={navigate} />;
  } else if (path === "/dashboard") {
    page = (
      <PlaceholderPage
        title="Dashboard / Campaign Page"
        description="This page will list campaigns, status, and quick actions."
      />
    );
  } else if (path === "/email-editor") {
    page = <EmailEditor onNext={() => navigate("/template-selection")} />;
  } else if (path === "/template-selection") {
    page = (
      <PlaceholderPage
        title="Template Selection Page"
        description="This page will provide template cards, preview modal, and template selection state."
      />
    );
  } else if (path === "/contact-upload") {
    page = (
      <PlaceholderPage
        title="Contact Upload Page"
        description="This page will support CSV/TXT upload, validation, and parsed contact preview."
      />
    );
  } else if (path === "/preview-send") {
    page = (
      <PlaceholderPage
        title="Preview and Send Page"
        description="This page will render final email preview, contact count, and send action."
      />
    );
  } else if (path === "/success-status") {
    page = <SuccessStatusPage navigate={navigate} />;
  } else {
    page = (
      <PlaceholderPage
        title="Page not found"
        description="Use one of the routes in the top navigation."
      />
    );
  }

  return page;
}
