"use client";
import React from 'react';

export default function StatusBar({ data }) {
  const getBy = (label) => data.find((d) => d.label === label) || { label, value: 0, color: '#ccc' };

  const pending = getBy('승인 대기');
  const inProgress = getBy('진행 중');
  const closed = getBy('종결');
  const unresolved = getBy('미해결');

  // Stack only the first three in the vertical pill
  const stack = [pending, inProgress, closed];

  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <div className="flex items-center gap-6">
        {/* Left labels aligned to segments */}
        <div className="flex flex-col justify-between h-48 text-[14px] font-semibold text-white items-end pr-2">
          <div>승인 대기</div>
          <div>진행 중</div>
          <div>종결</div>
          <div>미해결</div>
        </div>

        {/* Right: vertical stacked pill + bottom unresolved pill */}
        <div className="flex flex-col items-center justify-between h-48">
          {/* Stacked pill (sizes and colors tuned to reference) */}
          <div className="w-20 h-36 rounded-[18px] overflow-hidden border border-[#f2f4dc] bg-[#f8fbe8]">
            <div className="flex flex-col h-full w-full">
              <div
                className="flex items-center justify-center text-[#232424]"
                style={{ flex: pending.value || 1, background: '#eff6cf' }}
              >
                <span className="text-[15px] font-semibold">{pending.value}</span>
              </div>
              <div
                className="flex items-center justify-center text-[#232424] border-t border-[#e1efae]"
                style={{ flex: inProgress.value || 1, background: '#d9f36a' }}
              >
                <span className="text-[15px] font-semibold">{inProgress.value}</span>
              </div>
              <div
                className="flex items-center justify-center text-[#232424] border-t border-[#e1efae]"
                style={{ flex: closed.value || 1, background: '#ccea69' }}
              >
                <span className="text-[15px] font-semibold">{closed.value}</span>
              </div>
            </div>
          </div>

          {/* Bottom unresolved pill */}
          <div className="w-20 h-8 rounded-[18px] bg-[#d9d9d9] flex items-center justify-center">
            <span className="text-[14px] font-semibold text-[#232424]">{unresolved.value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
