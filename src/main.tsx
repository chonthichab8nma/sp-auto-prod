import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { JobsStoreProvider } from "./features/jobs/hooks/JobsStoreProvider";
import AppToaster from "./shared/components/ui/AppToaster";
import { AuthProvider } from "./shared/auth/AuthProvider";

// import Sidebar from './components/Sidebar.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <JobsStoreProvider>
          <AppToaster />
          <App />
        </JobsStoreProvider>
      </AuthProvider>

      {/* <Sidebar
      activePath=''
      onLogout={() => {}}
      
      /> */}
    </BrowserRouter>
  </StrictMode>
);
