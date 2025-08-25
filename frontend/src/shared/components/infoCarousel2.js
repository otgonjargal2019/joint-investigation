import React, { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

const infoSlides = [
  {
    label: "불법 복제",
    country: "대한민국",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-teal-700",
  },
  {
    label: "모방",
    country: "베트남",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-green-400",
  },
  {
    label: "무단 사용",
    country: "필리핀",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-teal-700",
  },
  {
    label: "복제",
    country: "일본",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-purple-500",
  },
  {
    label: "불법 복제",
    country: "중국",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-red-500",
  },
];

const InfoCarousel = () => {
  const containerRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 3;

  const handleNext = () => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.scrollWidth / infoSlides.length;
    const maxScroll = infoSlides.length - visibleCount;

    const newIndex = Math.min(scrollIndex + 1, maxScroll);
    setScrollIndex(newIndex);
    container.scrollTo({
      left: newIndex * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex overflow-hidden scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {infoSlides.map((item, index) => (
          <div key={index} className="min-w-[33.3333%] px-2 shrink-0">
            <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className={`${item.color} px-3 py-2 text-white text-sm w-24`}
              >
                <div className="font-semibold">{item.label}</div>
                <div className="text-xs">{item.country}</div>
              </div>
              <div className="px-3 py-2 text-sm text-gray-800">
                <div className="font-medium">{item.code}</div>
                <div className="text-gray-600 text-sm">{item.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow border hover:bg-gray-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default InfoCarousel;
