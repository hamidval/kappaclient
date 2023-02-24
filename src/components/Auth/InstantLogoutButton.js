import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = async () => {
  const { logout } = await useAuth0();
  await logout({ returnTo: window.location.origin });

  return (
    <button onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  );
};

export default LogoutButton;