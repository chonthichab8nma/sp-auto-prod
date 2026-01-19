import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { JobsStoreProvider } from "./features/jobs/hooks/JobsStoreProvider";
import AppToaster from "./shared/components/ui/AppToaster";
// import Sidebar from './components/Sidebar.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <JobsStoreProvider>
        <AppToaster />
        <App />
      </JobsStoreProvider>

      {/* <Sidebar
      activePath=''
      onLogout={() => {}}
      
      /> */}
    </BrowserRouter>
  </StrictMode>
);
