import HeaderSpecial from "@/shared/widgets/header/headerSpecial";

export default async function AuthorizedUniqueLayout({ children }) {
  return (
    <div className="bg-black">
      <HeaderSpecial />
      {children}
    </div>
  );
}
