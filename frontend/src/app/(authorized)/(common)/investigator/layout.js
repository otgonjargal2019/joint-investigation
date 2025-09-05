import { notFound } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { roles } from "@/shared/roleDic";

export default async function InvestigatorLayout({ children }) {
  const user = await getUserFromCookie();

  //only for roles.INVESTIGATOR
  if (user.role !== roles.INVESTIGATOR) {
    notFound();
  }

  return <div>{children}</div>;
}
