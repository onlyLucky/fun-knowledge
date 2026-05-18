import { createBrowserRouter } from "react-router";
import { AuthGuard, wrap } from "./index";
import { Home, CardDetailPage, CategoryDetail } from "@/pages/home";
import { Discover, HotSearchPage } from "@/pages/discover";
import { Profile, ProfileEditPage, Favorites, CalendarPage } from "@/pages/profile";
import { SettingsPage, AboutPage, ContactUsPage, PrivacyPolicyPage, UserAgreementPage } from "@/pages/settings";
import { ErrorReportPage, ErrorReportDetailPage, ReportContentPage } from "@/pages/report";
import { WelcomePage, LoginPage, RegisterPage } from "@/pages/auth";

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
    ],
  },

  // Sub-pages (protected)
  { path: "/profile/edit",      Component: wrap(ProfileEditPage) },
  { path: "/favorites",         Component: wrap(Favorites) },
  { path: "/calendar",          Component: wrap(CalendarPage) },
  { path: "/settings",          Component: wrap(SettingsPage) },
  { path: "/about",             Component: wrap(AboutPage) },
  { path: "/category/:id",      Component: wrap(CategoryDetail) },
  { path: "/card/:id",          Component: wrap(CardDetailPage) },
  { path: "/error-reports",     Component: wrap(ErrorReportPage) },
  { path: "/error-reports/:id", Component: wrap(ErrorReportDetailPage) },
  { path: "/user-agreement",    Component: wrap(UserAgreementPage) },
  { path: "/privacy-policy",    Component: wrap(PrivacyPolicyPage) },
  { path: "/report-content",    Component: wrap(ReportContentPage) },
  { path: "/contact-us",        Component: wrap(ContactUsPage) },
  { path: "/hot-searches",      Component: wrap(HotSearchPage) },
]);
