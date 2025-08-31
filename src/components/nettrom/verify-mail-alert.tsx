"use client";

import { useAuth } from "@/hooks/useAuth";
import { Alert } from "./Alert";
import Link from "next/link";
import { Constants } from "@/constants";
import { Button } from "./Button";

export default function VerifyMailAlert() {
  const { user } = useAuth();
  if (!user || user.email_verified_at) return null;
  return (
    <div className="container my-2">
      <Alert
        classNames={{
          alert: "[&>svg]:text-red-500 text-red-500 bg-red-100",
        }}
        title="Verify your email to use all features."
        description="Note: Use your CURRENT BROWSER to open the email and click the verification link."
        action={
          <Link
            className="no-underline hover:no-underline"
            href={Constants.Routes.verifyEmail}
          >
            <Button className="bg-red-500 hover:bg-red-600">
              Not received email?
            </Button>
          </Link>
        }
      />
    </div>
  );
}
