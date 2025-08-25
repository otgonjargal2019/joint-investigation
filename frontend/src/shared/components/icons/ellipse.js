const Ellipse = ({ color = "#D8F177", width = 12, height = 12 }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx={width / 2}
      cy={height / 2}
      r={Math.min(width, height) / 2}
      fill={color}
    />
  </svg>
);

export default Ellipse;
