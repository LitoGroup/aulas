import type { NavIconName } from "@/lib/nav";

const paths: Record<NavIconName, React.ReactNode> = {
  panel: (
    <>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
    </>
  ),
  catalog: (
    <>
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2H8v12H3.5A1.5 1.5 0 0 1 2 12.5v-9z" />
      <path d="M14 3.5A1.5 1.5 0 0 0 12.5 2H8v12h4.5a1.5 1.5 0 0 0 1.5-1.5v-9z" />
    </>
  ),
  assessments: (
    <>
      <rect x="3" y="2" width="10" height="12" rx="1.5" />
      <path d="M5.5 6l1.5 1.5L9.5 5M5.5 10.5h5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  manage: <path d="M11.5 2.5l2 2L6 12l-2.8.8L4 10l7.5-7.5z" strokeLinejoin="round" />,
  users: (
    <>
      <circle cx="6" cy="5.5" r="2.5" />
      <path
        d="M1.5 13.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4M11 3.4a2.5 2.5 0 0 1 0 4.2M12.5 9.7c1.2.6 2 1.7 2 3"
        strokeLinecap="round"
      />
    </>
  ),
  account: (
    <>
      <circle cx="8" cy="5" r="2.8" />
      <path d="M2.5 14c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5" strokeLinecap="round" />
    </>
  ),
};

export function NavIcon({
  name,
  className = "h-4 w-4",
}: {
  name: NavIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
