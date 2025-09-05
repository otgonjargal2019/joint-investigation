import { notFound } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { roles } from "@/shared/roleDic";

export default async function InvestigationInfoLayout({ children }) {
  const user = await getUserFromCookie();

  //not for roles.PLATFORM_ADMIN
  if (
    user.role !== roles.INVESTIGATOR &&
    user.role !== roles.INV_ADMIN &&
    user.role !== roles.COPYRIGHT_HOLDER &&
    user.role !== roles.RESEARCHER
  ) {
    notFound();
  }

  return <div>{children}</div>;
}
