import { notFound } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { ROLES } from "@/shared/dictionary";

export default async function NoticeLayout({ children }) {
  const user = await getUserFromCookie();

  //not for ROLES.PLATFORM_ADMIN
  if (
    user.role !== ROLES.INVESTIGATOR &&
    user.role !== ROLES.INV_ADMIN &&
    user.role !== ROLES.COPYRIGHT_HOLDER &&
    user.role !== ROLES.RESEARCHER
  ) {
    notFound();
  }

  return <div>{children}</div>;
}
