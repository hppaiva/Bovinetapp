interface CattleTruckIconProps {
  className?: string;
  size?: number;
}

export function CattleTruckIcon({ className = "", size = 24 }: CattleTruckIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Truck body */}
      <rect
        x="8"
        y="25"
        width="55"
        height="35"
        rx="8"
        ry="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Truck cab */}
      <rect
        x="63"
        y="35"
        width="25"
        height="25"
        rx="5"
        ry="5"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Cow silhouette inside truck */}
      <g transform="translate(15, 30)">
        {/* Cow body */}
        <ellipse
          cx="20"
          cy="15"
          rx="15"
          ry="8"
          fill="currentColor"
        />
        
        {/* Cow head */}
        <ellipse
          cx="35"
          cy="12"
          rx="6"
          ry="5"
          fill="currentColor"
        />
        
        {/* Cow legs */}
        <rect x="12" y="20" width="2" height="6" fill="currentColor" />
        <rect x="18" y="20" width="2" height="6" fill="currentColor" />
        <rect x="24" y="20" width="2" height="6" fill="currentColor" />
        <rect x="30" y="20" width="2" height="6" fill="currentColor" />
        
        {/* Cow ears */}
        <ellipse cx="32" cy="8" rx="2" ry="3" fill="currentColor" />
        <ellipse cx="38" cy="8" rx="2" ry="3" fill="currentColor" />
        
        {/* Cow tail */}
        <path
          d="M 5 15 Q 2 18 4 22"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </g>
      
      {/* Truck wheels */}
      <circle
        cx="20"
        cy="70"
        r="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="50"
        cy="70"
        r="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="75"
        cy="70"
        r="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}