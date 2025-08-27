import { redirect } from "next/navigation";

import { getUserFromCookie } from "@/app/actions/auth";
import { AuthProvider } from "@/providers/authProviders";

export default async function AuthorizedLayout({ children }) {
  console.log("AuthorizedLayout--->");
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
