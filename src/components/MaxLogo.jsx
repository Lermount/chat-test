export default function MaxLogo({ className = "w-12 h-12" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="maxLogoGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#00B4FF" />
          <stop offset="50%" stopColor="#5B4BFF" />
          <stop offset="100%" stopColor="#9D00FF" />
        </linearGradient>
      </defs>
      <path
        d="M50 10C27.9 10 10 27.9 10 50C10 57.3 11.9 64.2 15.3 70.2L10.5 88.5C10 90.5 12 92.5 14 92L32.3 87.2C38.3 90.6 45.2 92.5 52.5 92.5C74.6 92.5 92.5 74.6 92.5 52.5C92.5 30.4 74.6 10 52.5 10H50Z"
        fill="url(#maxLogoGradient)"
      />
      <circle cx="51" cy="51" r="22" fill="#F4F4F5" />
    </svg>
  );
}
