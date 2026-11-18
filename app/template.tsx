/** Short fade + slide on every navigation (CSS only, never blocks content). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
