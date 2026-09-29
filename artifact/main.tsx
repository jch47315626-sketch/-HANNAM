import { createRoot } from "react-dom/client";
import { StoreProvider } from "@/lib/store";
import { MemoryRouter, splitHref, useRouterState } from "./shims/router";

import WelcomePage from "@/app/page";
import DemoPage from "@/app/demo/page";
import OnboardingPage from "@/app/onboarding/page";
import HomePage from "@/app/home/page";
import DiscoverPage from "@/app/discover/page";
import ChatPage from "@/app/chat/page";
import ConversationsPage from "@/app/conversations/page";
import ConnectPage from "@/app/connect/page";
import ProfilePage from "@/app/profile/page";
import ReportPage from "@/app/report/page";
import MePage from "@/app/me/page";
import SettingsPage from "@/app/settings/page";
import PremiumPage from "@/app/premium/page";

const ROUTES: Record<string, React.ComponentType> = {
  "/": WelcomePage,
  "/demo": DemoPage,
  "/onboarding": OnboardingPage,
  "/home": HomePage,
  "/discover": DiscoverPage,
  "/chat": ChatPage,
  "/conversations": ConversationsPage,
  "/connect": ConnectPage,
  "/profile": ProfilePage,
  "/report": ReportPage,
  "/me": MePage,
  "/settings": SettingsPage,
  "/premium": PremiumPage,
};

function Screen() {
  const { href } = useRouterState();
  const Page = ROUTES[splitHref(href).pathname] ?? WelcomePage;
  return <Page key={href} />;
}

createRoot(document.getElementById("app")!).render(
  <MemoryRouter>
    <StoreProvider>
      <Screen />
    </StoreProvider>
  </MemoryRouter>,
);
