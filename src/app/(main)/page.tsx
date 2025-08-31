import { redirect } from "next/navigation";
import { Constants } from "@/constants";

export default async function Home() {
  redirect(Constants.Routes.nettrom.index);
}
