import { redirect } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";

export default async function UnauthorizedLayout({ children }) {
  const user = await getUserFromCookie();

  if (user) {
    redirect("/");
  }

  return <div className="w-full">{children}</div>;
}
