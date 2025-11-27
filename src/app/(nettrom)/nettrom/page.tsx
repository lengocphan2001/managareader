import { notFound } from "next/navigation";

// /nettrom route no longer exists - show 404
export default function NettromNotFound() {
  notFound();
}

