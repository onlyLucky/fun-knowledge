import { NavLink, useLocation, useOutlet } from "react-router";
import { Home, Compass, User } from "lucide-react";
import { clsx } from "clsx";
import { useRef } from "react";
import { FavoritesProvider } from "@/providers/FavoritesContext";

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();

  // Detect if a modal route is currently active
  const isModal = location.pathname.startsWith('/card/') ||
                  location.pathname.startsWith('/category/') ||
                  location.pathname === '/favorites' ||
                  location.pathname === '/hot-searches';

  // Store the background outlet when not in modal
  const backgroundOutlet = useRef(outlet);
  if (!isModal) {
    backgroundOutlet.current = outlet;
  }

  return (
    <FavoritesProvider>
        <div className="flex flex-col h-full w-full bg-bg-page overflow-hidden relative">
          {/* Main Content Area - always render the background outlet */}
          <div className="flex-1 overflow-hidden relative">
            {backgroundOutlet.current}
          </div>

          {/* Bottom Tab Bar - hidden when modal is active */}
          {!isModal && (
            <div className="shrink-0 flex justify-center px-6 pt-2 pb-6 bg-bg-page">
              <div className="bg-primary rounded-[100px] flex items-center justify-around px-3 w-full h-[58px] shadow-[0_8px_28px_rgba(41,37,38,0.40)]">
                {/* Home */}
                <NavLink
                  to="/"
                  end
                  className="flex-1 flex flex-col items-center justify-center h-full rounded-[100px] transition-all duration-200"
                >
                  {({ isActive }) => (
                    <div className={clsx(
                      "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-[100px] transition-all",
                      isActive && "bg-white/15"
                    )}>
                      <Home size={19} strokeWidth={2} className={isActive ? "text-white" : "text-white/40"} />
                      <span className={clsx("text-[9px] font-medium", isActive ? "text-white" : "text-white/40")}>首页</span>
                    </div>
                  )}
                </NavLink>

                {/* Discover */}
                <NavLink
                  to="/discover"
                  className="flex-1 flex flex-col items-center justify-center h-full rounded-[100px] transition-all duration-200"
                >
                  {({ isActive }) => (
                    <div className={clsx(
                      "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-[100px] transition-all",
                      isActive && "bg-white/15"
                    )}>
                      <Compass size={19} strokeWidth={2} className={isActive ? "text-white" : "text-white/40"} />
                      <span className={clsx("text-[9px] font-medium", isActive ? "text-white" : "text-white/40")}>发现</span>
                    </div>
                  )}
                </NavLink>

                {/* Profile */}
                <NavLink
                  to="/profile"
                  className="flex-1 flex flex-col items-center justify-center h-full rounded-[100px] transition-all duration-200"
                >
                  {({ isActive }) => (
                    <div className={clsx(
                      "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-[100px] transition-all",
                      isActive && "bg-white/15"
                    )}>
                      <User size={19} strokeWidth={2} className={isActive ? "text-white" : "text-white/40"} />
                      <span className={clsx("text-[9px] font-medium", isActive ? "text-white" : "text-white/40")}>我的</span>
                    </div>
                  )}
                </NavLink>
              </div>
            </div>
          )}

          {/* Modal outlet - rendered when modal route is active */}
          {isModal && outlet}
        </div>
      </FavoritesProvider>
  );
}
