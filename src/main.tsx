import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

import AppToaster from "./shared/components/ui/AppToaster";
import { AuthProvider } from "./shared/auth/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppToaster />
        <App />
      </AuthProvider>

      {/* <Sidebar
      activePath=''
      onLogout={() => {}}
      
      /> */}
    </BrowserRouter>
    {" "}
  </StrictMode>,
);
