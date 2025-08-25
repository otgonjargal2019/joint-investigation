import SimpleHeader from "@/shared/widgets/header/headerSimple";

export default function Layout({ children }) {
  return (
    <div className="px-8 py-[30px]">
      <SimpleHeader />
      {children}
    </div>
  );
}
