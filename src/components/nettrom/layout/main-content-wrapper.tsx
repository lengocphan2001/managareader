"use client";

import { useSidebar } from "@/contexts/sidebar";
import { twMerge } from "tailwind-merge";

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={twMerge(
        "flex-1 min-w-0 transition-all duration-300",
        isOpen ? "lg:ml-96" : "lg:ml-0"
      )}
    >
      {children}
    </div>
  );
}

