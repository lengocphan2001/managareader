import { Metadata } from "next";
import { Constants } from "@/constants";
import dynamic from "next/dynamic";

// Lazy load ToastContainer to avoid hydration issues
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => ({ default: mod.ToastContainer })),
  { ssr: false }
);

export const metadata: Metadata = {
  title: `Login - ${Constants.APP_NAME}`,
  description: `Sign in to ${Constants.APP_NAME}`,
  metadataBase: new URL(Constants.APP_URL),
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen">{children}</main>
      <ToastContainer theme="dark" />
    </>
  );
}

