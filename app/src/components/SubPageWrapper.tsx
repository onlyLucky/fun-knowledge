/**
 * Wraps standalone sub-pages (no tabbar) so they
 * fill the entire phone frame with the correct bg.
 */
export function SubPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen max-h-[896px] bg-[#F2F2F2] flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
