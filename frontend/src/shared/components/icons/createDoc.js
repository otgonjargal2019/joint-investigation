const CreateDoc = ({ color = "#585858", width = 60, height = 60 }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.2 20.6003H3.39999C2.0745 20.6003 0.999991 19.5258 1 18.2003L1.00009 3.80038C1.0001 2.4749 2.07462 1.40039 3.40009 1.40039H14.2004C15.5258 1.40039 16.6004 2.47491 16.6004 3.80039V10.4004M15.1941 20.1886V16.7945M15.1941 16.7945V13.4004M15.1941 16.7945L11.8 16.7945M15.1941 16.7945L18.5882 16.7945M5.20037 6.20039H12.4004M5.20037 9.80039H12.4004M5.20037 13.4004H8.80038"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CreateDoc;
