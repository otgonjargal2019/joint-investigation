const PaperPlane = ({ color = "white" }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.4483 1.55165L9.34005 12.66M1.90739 7.0784L19.2052 1.07712C20.2704 0.707548 21.2925 1.72956 20.9229 2.7948L14.9216 20.0926C14.5105 21.2776 12.8464 21.3101 12.3894 20.142L9.64259 13.1225C9.5054 12.772 9.22804 12.4946 8.87746 12.3574L1.85795 9.61065C0.689888 9.15358 0.722378 7.48953 1.90739 7.0784Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
export default PaperPlane;
