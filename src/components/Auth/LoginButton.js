import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect ,user,isAuthenticated, isLoading } = useAuth0();
if(isAuthenticated){
  
 
  setToken(user.nickname.token)

  return  null
}
  return <button className="btn btn-outline-primary" onClick={() => loginWithRedirect()}>Log In</button>;
};

async function  setToken (token)  {
  
  localStorage.setItem('token', token);

  if(token == 0){
    alert('intruder reported')
  }
  
}

export default LoginButton;