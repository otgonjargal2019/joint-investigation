import Header from "@/shared/widgets/header";

export default async function AuthorizedCommonLayout({ children }) {
  return (
    <div className="px-8 py-[30px]">
      <Header />
      {children}
    </div>
  );
}
