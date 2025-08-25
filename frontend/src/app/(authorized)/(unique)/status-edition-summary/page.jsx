"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { countries as countryData } from "@/data/investigationData";

import Globe from "@/shared/components/investigation/Globe";
import BarChart from "@/shared/components/investigation/BarChart";
import StatusBar from "@/shared/components/investigation/StatusBar";
import StageCards from "@/shared/components/investigation/StageCards";
import investigationData from "@/data/investigationData";

// Colors (match screenshot palette)
const COLORS = {
  드라마: "#36E1E9", // cyan
  영화: "#1BD3C1", // teal
  웹툰: "#8FE36A", // green
  음원: "#D9F36A", // light yellow-green
};
const ORDER = ["드라마", "영화", "웹툰", "음원"];

// Per-ring radii to create separated multi-rings
const RINGS = [
  { key: "음원", inner: 26, outer: 30 },
  { key: "웹툰", inner: 36, outer: 40 },
  { key: "영화", inner: 46, outer: 50 },
  { key: "드라마", inner: 56, outer: 60 },
];

function CountryRingChart({ country }) {
  const [hover, setHover] = useState({ visible: false, x: 0, y: 0 });
  // Convert 0~100 values to [value, remainder] per ring
  const ringData = (k) => [
    { name: k, value: country.stats[k] ?? 0 },
    { name: "rest", value: 100 - (country.stats[k] ?? 0) },
  ];

  return (
    <div
      className="relative w-full rounded-2xl border border-[#3a3a3a] bg-[#1f2020] p-5 outline-none focus:outline-none focus-visible:outline-none"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={(e) => setHover((h) => ({ ...h, visible: true }))}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHover({
          visible: true,
          x: e.clientX - rect.left + 12,
          y: e.clientY - rect.top + 12,
        });
      }}
      onMouseLeave={() => setHover({ visible: false, x: 0, y: 0 })}
    >
      {/* subtle dark disc behind arcs */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-36 w-36 rounded-full bg-[#1f2020]" />
      </div>

      <div className="relative h-40 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="outline-none focus:outline-none"
        >
          <PieChart
            className="outline-none focus:outline-none"
            accessibilityLayer={false}
            tabIndex={-1}
            role="presentation"
            aria-hidden="true"
          >
            {RINGS.map((r) => (
              <Pie
                key={r.key}
                data={ringData(r.key)}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                innerRadius={r.inner}
                outerRadius={r.outer}
                isAnimationActive
                animationDuration={800}
                stroke="none"
                paddingAngle={2}
                cornerRadius={5}
              >
                <Cell fill={COLORS[r.key]} />
                <Cell fill="#2b2c2c" />
              </Pie>
            ))}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* hover tooltip over the entire wrapper */}
      {hover.visible && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: "50%",
            bottom: -80,
            transform: "translateX(-50%)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#0f1110",
              border: "1px solid #e6f36a",
              color: "#ffffff",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 13,
              minWidth: 140,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {country.name}
            </div>
            {ORDER.map((k) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <span style={{ color: COLORS[k] }}>{k} :</span>
                <span style={{ color: COLORS[k] }}>
                  {country.stats[k] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* center label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-semibold text-white">
          {country.name}
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#d8d8d8]">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[13px]">{label}</span>
    </span>
  );
}

export default function InvestigationDashboard() {
  return (
    <div className="min-h-screen bg-[#232424] flex flex-col items-center py-6 px-2 md:px-8">
      <div className="w-full flex flex-col md:flex-row gap-8">
        {/* Left: Globe */}
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <Globe pins={investigationData.globePins} />
        </div>
        {/* Right: Charts and Cards */}
        <div className="flex-[1.2] flex flex-col gap-6">
          {/* Top: Circular Charts */}
          <div>
            <section className="w-full">
              {/* Title and legend row */}
              <div className="mb-4 relative">
                <div className="text-center text-[20px] font-semibold text-white">
                  국가 별 사건 발생 통계
                </div>
                <div className="mt-2 h-[2px] w-full bg-[#e6f36a] rounded-full" />

                <div className="absolute right-0 top-0 shrink-0">
                  <div className="flex items-center gap-4 text-sm">
                    <LegendDot color={COLORS["드라마"]} label="드라마" />
                    <LegendDot color={COLORS["영화"]} label="영화" />
                    <LegendDot color={COLORS["웹툰"]} label="웹툰" />
                    <LegendDot color={COLORS["음원"]} label="음원" />
                  </div>
                </div>
              </div>

              {/* Grid of 4 charts */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {countryData.map((c) => (
                  <CountryRingChart key={c.name} country={c} />
                ))}
              </div>
            </section>
          </div>
          {/* Middle: Bar Chart and Status Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-4/6">
              <div className="mb-3">
                <div className="text-center text-[18px] font-semibold text-white">
                  {"국가 별 저작권 침해 발생 콘텐츠 통계"}
                </div>
                <div className="mt-2 h-[2px] w-full bg-[#e6f36a] rounded-full" />
              </div>
              <div className="w-full bg-[#1f2020] rounded-xl p-4 border border-[#3a3a3a]">
                <BarChart data={investigationData.contentStats} />
              </div>
            </div>
            <div className="w-full md:w-2/6 flex flex-col">
              <div className="mb-3">
                <div className="text-center text-[18px] font-semibold text-white">
                  {"전체 사건 통계"}
                </div>
                <div className="mt-2 h-[2px] w-full bg-[#e6f36a] rounded-full" />
              </div>
              <div className="w-full flex-1 bg-[#1f2020] rounded-xl p-4 border border-[#3a3a3a] flex flex-col items-center">
                <StatusBar data={investigationData.statusStats} />
              </div>
            </div>
          </div>
          {/* Bottom: Stage Cards */}
          <div className="mt-2">
            <div className="mb-3">
              <div className="text-center text-[18px] font-semibold text-white">
                {"저작권 침해 조사 단계 별 사건 수"}
              </div>
              <div className="mt-2 h-[2px] w-full bg-[#e6f36a] rounded-full" />
            </div>
            <StageCards stages={investigationData.stages} />
          </div>
        </div>
      </div>
    </div>
  );
}
