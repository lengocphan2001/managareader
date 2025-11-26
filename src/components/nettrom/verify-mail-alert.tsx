"use client";

import { useAuth } from "@/hooks/useAuth";
import { Alert } from "./Alert";
import Link from "next/link";
import { Constants } from "@/constants";
import { Button } from "./Button";

export default function VerifyMailAlert() {
  // User registered is automatically verified, no need to show verification banner
  return null;
}
