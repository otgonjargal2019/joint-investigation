export default function Notice({ text, date }) {
  return (
    <div className="px-[20.6px] py-[12px] bg-color-92 hover:bg-color-95 flex justify-between items-center rounded-15 text-[24px] font-[400]">
      <p className="text-black">{text}</p>
      <p className="text-color-96">{date}</p>
    </div>
  );
}
