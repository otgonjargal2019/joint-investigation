"use client";

import React from 'react';
import { BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Match palette used throughout the dashboard
const COLORS = ['#36E1E9', '#1BD3C1', '#8FE36A', '#D9F36A'];
const LABELS = ['드라마', '영화', '웹툰', '음원'];

function LegendDots() {
  return (
    <div className="flex items-center justify-center gap-6 mt-2 text-[12px] text-[#d8d8d8]">
      {LABELS.map((label, i) => (
        <span key={label} className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COLORS[i] }}
          />
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}

export default function BarChart({ data }) {
  return (
    <div
      className="w-full outline-none focus:outline-none focus-visible:outline-none"
      onMouseDown={(e) => e.preventDefault()}
    >

      <div className="h-56">
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="outline-none focus:outline-none"
        >
          <RBarChart
            data={data}
            barCategoryGap={44}
            barGap={12}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            className="outline-none focus:outline-none"
            accessibilityLayer={false}
            tabIndex={-1}
            role="presentation"
            aria-hidden="true"
          >
            <XAxis
              dataKey="country"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#e6e6e6', fontSize: 12 }}
            />
            <YAxis tick={false} tickLine={false} axisLine={false} width={0} />
            <Tooltip
              contentStyle={{
                background: '#0f1110',
                border: '1px solid #e6f36a',
                color: '#ffffff',
                borderRadius: 8,
              }}
              wrapperStyle={{ pointerEvents: 'none', zIndex: 9999 }}
              cursor={false}
              offset={12}
              allowEscapeViewBox={{ x: true, y: true }}
            />
            <Legend content={<LegendDots />} />
            {LABELS.map((label, i) => (
              <Bar
                key={label}
                dataKey={label}
                fill={COLORS[i % COLORS.length]}
                radius={[6, 6, 6, 6]}
                barSize={10}
              />
            ))}
          </RBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
