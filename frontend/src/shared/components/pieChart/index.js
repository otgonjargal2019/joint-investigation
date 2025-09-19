"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import React from "react";

import "./pieChart.css";

export default function DonutChart({ data, isLoading = true }) {
  const t = useTranslations();

  const loadingData = [
    { name: t("donut-chart.ongoing"), value: 1, type: "#8E8E8E" },
  ];

  const legendItems = isLoading
    ? [
        { name: t("donut-chart.ongoing"), value: 0, type: "#8E8E8E" },
        { name: t("donut-chart.unresolved"), value: 0, type: "#8E8E8E" },
        { name: t("donut-chart.termination"), value: 0, type: "#8E8E8E" },
      ]
    : data;

  const chartData = isLoading ? loadingData : data;
  const total = isLoading ? 0 : data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col lg:flex-row justify-start items-center gap-6">
      {/* Donut chart */}
      <div className="donut-chart-wrapper relative  w-[250px] h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Outer gray circle as background */}
            <Pie
              data={[{ value: 1 }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={127}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              label={false}
              isAnimationActive={false}
            >
              <Cell fill="#8E8E8E" />
            </Pie>

            {/* Actual chart data on top */}
            {!isLoading && (
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={127}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.type} />
                ))}
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center total */}
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          <span className="text-[19.9px] text-color-33 font-[500]">
            {t("total")}
          </span>
          <span className="text-[40px] font-[700] text-color-5">{total}</span>
          <span className="text-[19.9px] text-color-33 font-[500]">
            {t("case")}
          </span>
        </div>
      </div>

      {/* Legend - responsive positioning */}
      <div className="space-y-2 min-w-[150px] w-full lg:w-auto">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-[10px] h-[10px] rounded-full flex-shrink-0"
              style={{ backgroundColor: item.type }}
            />
            <div className="flex justify-between items-center gap-4 w-full">
              <span className="text-[20px] font-[400] text-color-21">
                {item.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[20px] font-[500] text-black">
                  {item.value}
                </span>
                <span className="text-[14px] font-[500] text-color-33">
                  {t("case")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
