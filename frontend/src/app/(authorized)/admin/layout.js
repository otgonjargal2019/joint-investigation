import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";
import Header from "@/shared/widgets/header";
import { roles } from "@/shared/roleDic";

export default async function AdminLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role !== roles.PLATFORM_ADMIN) {
    notFound();
  }

  return (
    <div className="px-8 py-[30px]">
      <Header />
      {children}
    </div>
  );
}
