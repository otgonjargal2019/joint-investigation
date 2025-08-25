"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#6fffd2', '#e6f36a', '#b6f36a', '#e6e6e6'];
const LABELS = ['드라마', '영화', '웹툰', '음원'];

export default function CircularChart({ country }) {
  const data = LABELS.map((label, i) => ({
    name: label,
    value: country.stats[label],
  }));
  return (
    <div className="bg-[#232424] rounded-xl p-4 flex flex-col items-center border border-[#3a3a3a]">
      <div className="w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={32}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-sm font-semibold text-[#e6f36a]">{country.name}</div>
    </div>
  );
}
