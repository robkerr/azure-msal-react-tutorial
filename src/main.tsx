import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const client_id = import.meta.env.VITE_ENTRA_CLIENT_ID
const authority = import.meta.env.VITE_ENTRA_AUTHORITY

const msal_configuration = {
  auth: {
    clientId: client_id, 
    authority: authority, 
    redirectUri: "/",
    postLogoutRedirectUri: "/"
  }
};

const pca = new PublicClientApplication(msal_configuration);

const AppProvider = () => (
  <MsalProvider instance={pca}>
    <App />
  </MsalProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider />
  </StrictMode>,
)
