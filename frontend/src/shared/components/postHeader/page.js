const NoticeHeader = ({ label, info }) => {
  const items = [
    { label: label.date, value: info.date },
    { label: label.author, value: info.author },
    { label: label.view, value: info.view },
  ];

  return (
    <div className="w-full bg-white border-t-[2px] border-t-color-93 border-b-[2px] border-b-color-97 p-6">
      <div>
        <p className="text-black text-[25px] font-bold text-center">
          {info.title}
        </p>
      </div>
      <dl className="mt-[30px] flex flex-wrap justify-center text-[20px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex gap-2 items-center px-4 ${
              idx !== 0 ? "border-l border-color-58" : ""
            }`}
          >
            <dt className="text-black font-normal">{item.label}</dt>
            <dd className="text-color-38 font-normal">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default NoticeHeader;
