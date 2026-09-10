/** SkillSwap application shell — preserves the Aurora Kinetics electric 3D visual system. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SkillSwapProvider } from "./contexts/SkillSwapContext";
import { AccountProvider } from "./contexts/AccountContext";
import { useAccount } from "./contexts/AccountContext";
import { AppChrome } from "./components/AppChrome";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Professionals from "./pages/Professionals";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import { About, Dashboard, Discover, LearningHub, Matches, Saved, SearchResults, Sessions, SkillDetail } from "./pages/ProductPages";
import Profile from "./pages/ProfileWorkspace";
import { SavedRepair, SearchRepair, SkillDetailRepair } from "./pages/RepairWorkspaces";
import Wallet from "./pages/WalletRepair";
import Community from "./pages/CommunityRepair";
import Help from "./pages/HelpRepair";
import Settings from "./pages/SettingsRepair";
import SessionsRepair from "./pages/SessionsRepair";
import BorderGlowPage from "./pages/BorderGlowDemoPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import GetStarted from "./pages/GetStarted";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function Router() {
  const [location] = useLocation();
  useScrollReveal(location);
  if (["/login", "/signup", "/onboarding", "/get-started"].includes(location)) return <Switch>
    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route path="/get-started" component={GetStarted} />
    <Route path="/onboarding" component={Onboarding} />
  </Switch>;
  if (["/", "/home", "/landing"].includes(location)) return <Switch>
    <Route path="/" component={Home} />
    <Route path="/home" component={Home} />
    <Route path="/landing" component={Home} />
  </Switch>;
  if (location === "/privacy") return <Switch>
    <Route path="/privacy" component={PrivacyPolicy} />
  </Switch>;
  if (["/border-glow", "/demo"].includes(location)) return <Switch>
    <Route path="/border-glow" component={BorderGlowPage} />
    <Route path="/demo" component={BorderGlowPage} />
  </Switch>;
  return (
    <AppChrome><Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/discover" component={Discover} />
      <Route path="/search" component={SearchRepair} />
      <Route path="/skills/:slug" component={SkillDetailRepair} />
      <Route path="/learn">{() => <LearningHub mode="learn" />}</Route>
      <Route path="/teach">{() => <LearningHub mode="teach" />}</Route>
      <Route path="/professionals" component={Professionals} />
      <Route path="/professionals/:id" component={ProfessionalProfile} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/messages" component={Messages} />
      <Route path="/sessions" component={SessionsRepair} />
      <Route path="/saved" component={SavedRepair} />
      <Route path="/matches" component={Matches} />
      <Route path="/community" component={Community} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/about" component={About} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch></AppChrome>
  );
}

function AccountScopedSkillSwap() {
  const { account } = useAccount();
  return <SkillSwapProvider key={account?.id ?? "guest"} accountId={account?.id}><Router /></SkillSwapProvider>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={false}>
        <TooltipProvider>
          <Toaster />
          <AccountProvider><AccountScopedSkillSwap /></AccountProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
