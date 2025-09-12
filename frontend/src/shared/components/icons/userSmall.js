const UserSmall = ( {avatar} ) => {
  return !avatar  ? (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 38.8071 38.8071 50 25 50C11.1929 50 0 38.8071 0 25Z"
        fill="#898989"
        fillOpacity="0.5"
      />
      <circle cx="24.9998" cy="19.4446" r="11.1111" fill="#B5B5B5" />
      <path
        d="M25.0007 33.3335C32.5214 33.3335 39.0442 36.9936 42.2787 42.3486C42.4403 42.6162 42.391 42.959 42.1638 43.1737C37.6858 47.4046 31.6465 50.0005 24.9998 50.0005C18.3537 50.0005 12.3145 47.4057 7.83674 43.1756C7.60947 42.9609 7.56016 42.6182 7.72176 42.3505C10.9558 36.9945 17.4792 33.3335 25.0007 33.3335Z"
        fill="#B5B5B5"
      />
    </svg>
  ) : (
    <img
      src={avatar}
      alt="User"
      className="w-12 h-12 rounded-full object-cover"
    />
  );
};

export default UserSmall;
