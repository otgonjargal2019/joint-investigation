import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";

export default async function InvestigationInfoLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role === "admin") {
    notFound();
  }

  return <div>{children}</div>;
}
