import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/actions/auth";
import Header from "@/shared/widgets/header";

export default async function AdminLayout({ children }) {
  const user = await getUserFromCookie();

  if (user.role !== "admin") {
    notFound();
  }

  return (
    <div className="px-8 py-[30px]">
      <Header />
      {children}
    </div>
  );
}
