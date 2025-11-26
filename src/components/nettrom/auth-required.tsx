"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Constants } from "@/constants";

interface AuthRequiredProps {
  title?: string;
  message?: string;
}

export default function AuthRequired({
  title = "Updates",
  message = "You need to sign in to access this page.",
}: AuthRequiredProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center px-24 py-24">
      <div className="mb-8 flex w-full items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 text-white transition-colors hover:text-orange-500"
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="mb-8 text-lg text-white">{message}</p>

        <div className="flex gap-4">
          <Link
            href={Constants.Routes.login}
            className="rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            Sign in
          </Link>
          <Link
            href={Constants.Routes.signup}
            className="rounded-lg bg-neutral-700 px-6 py-3 font-medium text-neutral-300 transition-colors hover:bg-neutral-600"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
