import { redirect } from "next/navigation";

import { getUserFromCookie, getStayLoggedIn } from "@/app/actions/auth";
import { AuthProvider } from "@/providers/authProviders";
import { RealtimeProvider } from "@/providers/realtimeProvider";
import { UserInfoProvider } from "@/providers/userInfoProviders";
import LogoutOnClose from "@/shared/components/logoutOnClose";

export default async function AuthorizedLayout({ children }) {
  console.log("AuthorizedLayout--->");
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  const stayLoggedIn = await getStayLoggedIn();

  return (
    <AuthProvider initialUser={user}>
      <UserInfoProvider>
        <RealtimeProvider>
          <LogoutOnClose stayLoggedIn={stayLoggedIn == "true"} />
          {children}
        </RealtimeProvider>
      </UserInfoProvider>
    </AuthProvider>
  );
}
