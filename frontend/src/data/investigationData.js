// Investigation dashboard static data

export const globePins = [
  { lat: 39, lng: -98, label: 'North America' },
  { lat: -14, lng: -60, label: 'South America' },
  { lat: 54, lng: 15, label: 'Europe' },
  { lat: 7, lng: 21, label: 'Africa' },
  { lat: 30, lng: 105, label: 'Asia' },
  { lat: -25, lng: 134, label: 'Oceania' },
];

export const countries = [
  {
    name: '태국',
    stats: { 드라마: 80, 영화: 60, 웹툰: 40, 음원: 70 },
  },
  {
    name: '베트남',
    stats: { 드라마: 60, 영화: 90, 웹툰: 50, 음원: 80 },
  },
  {
    name: '대만',
    stats: { 드라마: 50, 영화: 40, 웹툰: 80, 음원: 60 },
  },
  {
    name: '필리핀',
    stats: { 드라마: 70, 영화: 60, 웹툰: 60, 음원: 90 },
  },
];

export const contentStats = [
  { country: '태국', 드라마: 18, 영화: 12, 웹툰: 8, 음원: 15 },
  { country: '베트남', 드라마: 15, 영화: 20, 웹툰: 10, 음원: 18 },
  { country: '대만', 드라마: 10, 영화: 8, 웹툰: 18, 음원: 12 },
  { country: '필리핀', 드라마: 14, 영화: 12, 웹툰: 12, 음원: 20 },
];

export const statusStats = [
  { label: '승인 대기', value: 18, color: '#e6f36a' },
  { label: '진행 중', value: 37, color: '#6fffd2' },
  { label: '종결', value: 21, color: '#b6f36a' },
  { label: '미해결', value: 6, color: '#e6e6e6' },
];

export const stages = [
  { label: '사전 조사', value: 21 },
  { label: '디지털 증거 수집 중', value: 15 },
  { label: '디지털 증거 이송', value: 8 },
  { label: '디지털 증거 분석 중', value: 23 },
  { label: '디지털 증거 보고', value: 17 },
  { label: '디지털 증거 파기', value: 162 },
];

export default {
  globePins,
  countries,
  contentStats,
  statusStats,
  stages,
};
