import { useEffect, useState } from "react";
import EmailEditor from "./components/EmailEditor";
import LandingPage from "./Pages/LandingPage";
import PlaceholderPage from "./Pages/PlaceholderPage";
import SuccessStatusPage from "./Pages/SuccessStatusPage";

const NAV_ITEMS = [
  { label: "Landing", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Email Editor", path: "/email-editor" },
  { label: "Template Selection", path: "/template-selection" },
  { label: "Contact Upload", path: "/contact-upload" },
  { label: "Preview & Send", path: "/preview-send" },
  { label: "Success Status", path: "/success-status" },
];

function RouteButton({ active, label, path, onNavigate }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(path)}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {label}
    </button>
  );
}

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

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-slate-300/80 bg-white/85 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <RouteButton
              key={item.path}
              label={item.label}
              path={item.path}
              active={path === item.path}
              onNavigate={navigate}
            />
          ))}
        </div>
      </div>

      {page}
    </>
  );
}