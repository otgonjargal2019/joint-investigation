import { notFound } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { ROLES } from "@/shared/dictionary";

export default async function InvestigatorLayout({ children }) {
  const user = await getUserFromCookie();

  //only for ROLES.INVESTIGATOR, ROLES.RESEARCHER
  if (user.role !== ROLES.INVESTIGATOR && user.role !== ROLES.RESEARCHER) {
    notFound();
  }

  return <div>{children}</div>;
}
