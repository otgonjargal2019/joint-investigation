import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";
import { roles } from "@/shared/roleDic";

export default async function ManagerLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role !== roles.INV_ADMIN && user.role !== roles.PLATFORM_ADMIN) {
    notFound();
  }

  return <div>{children}</div>;
}
