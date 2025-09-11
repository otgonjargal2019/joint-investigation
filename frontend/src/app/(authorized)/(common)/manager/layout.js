import { notFound, redirect } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { ROLES } from "@/shared/dictionary";

export default async function ManagerLayout({ children }) {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== ROLES.INV_ADMIN && user.role !== ROLES.PLATFORM_ADMIN) {
    notFound();
  }

  return <div>{children}</div>;
}
