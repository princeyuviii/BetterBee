import type { SVGProps } from "react";

export function BeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Custom stylized bee */}
      <path d="M12 2v20M17 5a4.5 4.5 0 0 1 0 9H7a4.5 4.5 0 0 1 0-9h10z" />
      <path d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
      <path d="M8.5 7.5c-.5-1.5-2-2.5-3.5-2s-2 2-1.5 3.5M15.5 7.5c.5-1.5 2-2.5 3.5-2s2 2 1.5 3.5" />
    </svg>
  );
}
