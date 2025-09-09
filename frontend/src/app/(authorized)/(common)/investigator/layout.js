import { notFound } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { ROLES } from "@/shared/dictionary";

export default async function InvestigatorLayout({ children }) {
  const user = await getUserFromCookie();

  //only for ROLES.INVESTIGATOR
  if (user.role !== ROLES.INVESTIGATOR) {
    notFound();
  }

  return <div>{children}</div>;
}
