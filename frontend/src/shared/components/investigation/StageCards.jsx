"use client";

import React from 'react';
import { IoChevronForwardOutline } from 'react-icons/io5';

export default function StageCards({ stages }) {
  const Arrow = () => (
    <div className="hidden md:flex items-center justify-center px-1">
      <IoChevronForwardOutline className="text-[#808080]" size={36} />
    </div>
  );

  const Card = ({ label, value }) => (
    <div
      className="bg-[#1f2020] border border-[#3a3a3a] rounded-xl flex flex-col items-center justify-between py-3 px-3 w-[120px]"
      style={{ aspectRatio: '7 / 9' }}
    >
      <div className="text-[17.154px] font-semibold text-white text-center leading-tight whitespace-pre-line mt-1">
        {label}
      </div>
      <div className="mt-auto mb-3 flex items-end justify-center leading-none">
        <span
          className="text-[40px] font-extrabold leading-none inline-block"
          style={{
            background: 'linear-gradient(180deg, #E6E6E6 0%, #4E5B1C 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          {value}
        </span>
        <span className="ml-1 text-[#cbd0c0] text-[18px] leading-none inline-block" style={{ verticalAlign: 'sub' }}>건</span>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-row flex-wrap justify-between gap-1">
      {stages.map((stage, idx) => (
        <React.Fragment key={stage.label}>
          <Card label={stage.label} value={stage.value} />
          {idx < stages.length - 1 && <Arrow />}
        </React.Fragment>
      ))}
    </div>
  );
}
