import React, { useRef, useState } from "react";
import Slider from "react-slick";
import { ChevronRight, ChevronLeft } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const infoSlides = [
  {
    label: "불법 복제",
    country: "대한민국",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-[#D8F177]",
  },
  {
    label: "모방",
    country: "베트남",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-[#85D685]",
  },
  {
    label: "무단 사용",
    country: "필리핀",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-[#3EB491]",
  },
  {
    label: "복제",
    country: "일본",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-[#08908F]",
  },
  {
    label: "복제",
    country: "일본",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-[#206B7B]",
  },
  {
    label: "복제",
    country: "일본",
    code: "156-8156",
    desc: "해외 공유 플랫폼 사이트에 업로드 사건",
    color: "bg-[#2F4858]",
  },
];

const InfoCarousel = () => {
  const sliderRef = useRef();
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = infoSlides.length;
  const visibleSlides = 3;
  const lastSlideIndex = totalSlides - visibleSlides;

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: visibleSlides,
    slidesToScroll: 1,
    swipeToSlide: true,
    touchMove: true,
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleArrowClick = () => {
    if (currentSlide >= lastSlideIndex) {
      sliderRef.current?.slickGoTo(0);
    } else {
      sliderRef.current?.slickNext();
    }
  };

  return (
    <div className="relative w-full">
      <div className="pr-16">
        <Slider ref={sliderRef} {...settings}>
          {infoSlides.map((item, index) => (
            <div
              key={index}
              className={`${index === 0 ? "pl-0 pr-2 py-2" : "px-2 py-2"}`}
            >
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
        </Slider>
      </div>

      <button
        onClick={handleArrowClick}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-lg shadow border border-gray-300 hover:bg-gray-100"
      >
        {currentSlide >= lastSlideIndex ? (
          <ChevronLeft size={38} className="text-gray-400" />
        ) : (
          <ChevronRight size={38} className="text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default InfoCarousel;
