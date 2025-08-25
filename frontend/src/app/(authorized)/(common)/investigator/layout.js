import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";

export default async function InvestigatorLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role === "admin" || user.role === "manager") {
    notFound();
  }

  return <div>{children}</div>;
}
