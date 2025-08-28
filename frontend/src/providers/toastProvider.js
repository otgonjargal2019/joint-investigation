"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      theme="colored"
      autoClose={3000}
      position="top-center"
    />
  );
}
