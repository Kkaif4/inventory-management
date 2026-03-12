import { signOut } from "next-auth/react";

export const logoutAndClearData = async (callbackUrl: string = "/login") => {
  if (typeof window !== "undefined") {
    // 1. Clear Local Storage
    window.localStorage.clear();

    // 2. Clear Session Storage
    window.sessionStorage.clear();

    // 3. Clear all non-HttpOnly cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }

  await signOut({ callbackUrl });
};
