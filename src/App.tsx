import { useState, useEffect } from 'react'
import './App.css'

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { BrowserUtils, SilentRequest } from "@azure/msal-browser";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('NOT LOGGED IN');

  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();  
  const account = instance.getActiveAccount();

  useEffect(() => {
    console.log('Component mounted. Checking login status...');
    if (isAuthenticated && account) {
      setIsLoggedIn(true);
      setUserDisplayName(account.name || 'UNKNOWN USER');
    }
  }, []);

  const handleLogin = async () => {
    console.log('Logging in with Entra ID...');

    var response = null;
    console.log("Trying silent login...");

    try {
      // Try silent login first
      try {
        response = await instance.ssoSilent({
            scopes: ["User.Read"], 
        });
      } catch (error) {
        console.log("Trying popup login...");
        response = await instance.loginPopup({
            scopes: ["User.Read"],
        });
      }

      if (response.account) {
        console.log(response.account);
        instance.setActiveAccount(response.account);
        setIsLoggedIn(true);
        setUserDisplayName(response.account.name || 'UNKNOWN USER');
        // In a real app we would redirect to the app's logged in page
      } else {
        console.error("Login failed (no account found).");
        setIsLoggedIn(false);
        alert(`Login failed. No account associated with this user.`);
      }  
    } catch (error: any) {
      console.error("Login failed:", error);
      setIsLoggedIn(false);
      alert(`Login failed. Please try again. ${error.message}`);
    }
  }

  const handleShowTokenInfo = async () => {
    const activeAccount = instance.getActiveAccount();

    const request:SilentRequest = {
      scopes: ["User.Read"],
      account: activeAccount || undefined
    };

    const result = await instance.acquireTokenSilent(request);
    // in a real app, we would use result.accessToken to form the 
    // header: Authorization: Bearer <access_token>

    console.log(`Token: ${result.accessToken}`);
    alert(`Token: ${result.accessToken}`);

  }

  const handleLogout = async () => {
    const activeAccount = instance.getActiveAccount();

    setIsLoggedIn(false);
    setUserDisplayName('LOGGED OUT');
    // Hello

    await instance.logoutRedirect({
      account: activeAccount,
      onRedirectNavigate: ()=> !BrowserUtils.isInIframe(),
    })
    .catch((e) => {
        console.error("An error occurred during logout:", e);
    });

  }



  return (
    <>
      <h1>React MSAL Tutorial</h1>
      {isLoggedIn && <p>Welcome, {userDisplayName}!</p>}
      <div className="card">
        {!isLoggedIn && (
          <div className="button-div">
            <button className='login-button' onClick={handleLogin}>Login with Entra ID</button>
          </div>
        )}
        {isLoggedIn && (
          <div className="button-div">
            <button className='token-button' onClick={handleShowTokenInfo}>Show Token Info</button>
          </div>
        )}
        {isLoggedIn && (
          <div className="button-div">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
