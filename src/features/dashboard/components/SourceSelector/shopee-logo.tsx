import React from 'react';
import type { SVGProps } from 'react';

export function ShopeeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={20} height={20} {...props}>
      <rect width="100" height="100" rx="10" fill="#EE4D2D" />
      <text
        x="50"
        y="70"
        fontSize="60"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
        fill="white"
      >
        S
      </text>
    </svg>
  );
}
