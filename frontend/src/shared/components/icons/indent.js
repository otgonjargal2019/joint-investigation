const Indent = ({ color = "#C3C3C3" }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1.44995L17 1.44995M10 6.43329L17 6.43328M10 11.4166L17 11.4166M1 16.3999H17M2 11.8H5C5.55228 11.8 6 11.2851 6 10.65V7.19995C6 6.56482 5.55228 6.04995 5 6.04995H2C1.44772 6.04995 1 6.56482 1 7.19995V10.65C1 11.2851 1.44772 11.8 2 11.8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Indent;
