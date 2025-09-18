"use client";
import { useEffect } from "react";

export default function LogoutOnClose({ stayLoggedIn }) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!stayLoggedIn) navigator.sendBeacon("/api/logout");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [stayLoggedIn]);

  return null;
}
