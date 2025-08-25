const Box = ({ color = "#C3C3C3" }) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.9399 5.25H1.06006M12 9C9.92534 9 7 9 7 9M18 5.75164V15.875C18 17.0486 17.0486 18 15.875 18H3.125C1.9514 18 1 17.0486 1 15.875V5.75164C1 5.42175 1.07681 5.09638 1.22434 4.80132L2.6845 1.881C2.95447 1.34107 3.50632 1 4.10999 1H14.89C15.4937 1 16.0455 1.34107 16.3155 1.881L17.7757 4.80132C17.9232 5.09638 18 5.42175 18 5.75164Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Box;
