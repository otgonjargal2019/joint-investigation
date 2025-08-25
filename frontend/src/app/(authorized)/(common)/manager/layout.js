import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";

export default async function ManagerLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role === "investigator") {
    notFound();
  }

  return <div>{children}</div>;
}
