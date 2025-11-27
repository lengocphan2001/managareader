import { redirect } from "next/navigation";

// Redirect /nettrom to / for backward compatibility
export default async function NettromRedirect() {
  redirect("/");
}
