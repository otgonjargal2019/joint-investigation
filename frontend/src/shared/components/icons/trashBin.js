const TrashBin = ({ color = "#656161" }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.92371 3.82353H16.0764M6.34642 1H11.6537M7.23096 13.2353V7.58824M10.7691 13.2353V7.58824M12.0959 17H5.90415C4.92711 17 4.13506 16.1572 4.13506 15.1176L3.73118 4.80389C3.71024 4.26918 4.11199 3.82353 4.61495 3.82353H13.3851C13.8881 3.82353 14.2898 4.26918 14.2689 4.80389L13.865 15.1176C13.865 16.1572 13.073 17 12.0959 17Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TrashBin;
