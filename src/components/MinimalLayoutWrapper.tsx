import { GoogleTagManager } from "@next/third-parties/google";
import { PropsWithChildren } from "react";
import { Constants } from "@/constants";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

// Minimal ToastContainer for auth pages only
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => ({ default: mod.ToastContainer })),
  { ssr: false }
);

// Minimal layout wrapper for auth pages (login, signup, etc.)
// Removes heavy providers and dependencies to improve load time
// Note: This is NOT a root layout, so it doesn't render <html> or <body>
export const MinimalLayoutWrapper = ({
  children,
  ...props
}: PropsWithChildren & {
  id: string;
}) => {
  return (
    <>
      {children}
      <ToastContainer theme="dark" />
    </>
  );
};

