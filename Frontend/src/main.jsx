import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider }  from "./context/AuthContext.jsx";
import { IssueProvider } from "./context/IssueContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <IssueProvider>
        <App />
      </IssueProvider>
    </AuthProvider>
  </React.StrictMode>
);