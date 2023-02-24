import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from "@auth0/auth0-react";
const REACT_APP_AUTH_DOMAIN = process.env.REACT_APP_AUTH_DOMAIN
const REACT_APP_AUTH_CLIENT_ID = process.env.REACT_APP_AUTH_CLIENT_ID
const redirectUri = process.env.REACT_APP_AUTH_CALLBACK_URL;
const audience = process.env.REACT_APP_AUTH_AUDIENCE;
const scope = process.env.REACT_APP_AUTH_SCOPE;

console.log(REACT_APP_AUTH_CLIENT_ID)
ReactDOM.render(
  
  <React.StrictMode>
    <Auth0Provider
    
     domain={REACT_APP_AUTH_DOMAIN}
     clientId={REACT_APP_AUTH_CLIENT_ID}
     redirectUri={window.location.origin}   
    audience={audience}
    scope={scope}
      
  
     >
      
       <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
