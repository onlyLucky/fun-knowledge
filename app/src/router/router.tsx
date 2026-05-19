import { createBrowserRouter } from "react-router";
import { AuthGuard, wrap } from "./index";
import { ModalRoute } from "@/components/ModalRoute";
import { Home, CardDetailPage, CategoryDetail } from "@/pages/home";
import { Discover, HotSearchPage } from "@/pages/discover";
import { Profile, ProfileEditPage, Favorites, BrowseHistory, CalendarPage } from "@/pages/profile";
import { SettingsPage, AboutPage, ContactUsPage, PrivacyPolicyPage, UserAgreementPage } from "@/pages/settings";
import { ErrorReportPage, ErrorReportDetailPage, ReportContentPage } from "@/pages/report";
import { WelcomePage, LoginPage, RegisterPage } from "@/pages/auth";

function CardModal() {
  return <ModalRoute><CardDetailPage /></ModalRoute>;
}

function CategoryModal() {
  return <ModalRoute><CategoryDetail /></ModalRoute>;
}

function FavoritesModal() {
  return <ModalRoute><Favorites /></ModalRoute>;
}

function BrowseHistoryModal() {
  return <ModalRoute><BrowseHistory /></ModalRoute>;
}

function HotSearchModal() {
  return <ModalRoute><HotSearchPage /></ModalRoute>;
}

export const router = createBrowserRouter([
  // Auth routes (always accessible)
  { path: "/welcome",  Component: WelcomePage },
  { path: "/login",    Component: LoginPage },
  { path: "/register", Component: RegisterPage },

  // Main app (protected)
  {
    path: "/",
    Component: AuthGuard,
    children: [
      { index: true,         Component: Home },
      { path: "discover",    Component: Discover },
      { path: "profile",     Component: Profile },
      // Modal routes - Home stays mounted
      { path: "card/:id",    Component: CardModal },
      { path: "category/:id", Component: CategoryModal },
      { path: "favorites",   Component: FavoritesModal },
      { path: "browse-history", Component: BrowseHistoryModal },
      { path: "hot-searches", Component: HotSearchModal },
    ],
  },

  // Sub-pages (protected)
  { path: "/profile/edit",      Component: wrap(ProfileEditPage) },
  { path: "/calendar",          Component: wrap(CalendarPage) },
  { path: "/settings",          Component: wrap(SettingsPage) },
  { path: "/about",             Component: wrap(AboutPage) },
  { path: "/error-reports",     Component: wrap(ErrorReportPage) },
  { path: "/error-reports/:id", Component: wrap(ErrorReportDetailPage) },
  { path: "/user-agreement",    Component: wrap(UserAgreementPage) },
  { path: "/privacy-policy",    Component: wrap(PrivacyPolicyPage) },
  { path: "/report-content",    Component: wrap(ReportContentPage) },
  { path: "/contact-us",        Component: wrap(ContactUsPage) },
]);
