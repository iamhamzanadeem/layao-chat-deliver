import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize PWA install manager early to capture beforeinstallprompt event
import "./lib/pwaInstall";

createRoot(document.getElementById("root")!).render(<App />);
