import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";
import Header from "@/shared/widgets/header";
import { ROLES } from "@/shared/dictionary";

export default async function AdminLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role !== ROLES.PLATFORM_ADMIN) {
    notFound();
  }

  return (
    <div className="px-8 py-[30px]">
      <Header />
      {children}
    </div>
  );
}
