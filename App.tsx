import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminStories from "./pages/admin/AdminStories";
import AdminMessages from "./pages/admin/AdminMessages";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Stories from "./pages/Stories";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminCompetitions from "./pages/admin/AdminCompetitions";
import AdminCompetitionQuestions from "./pages/admin/AdminCompetitionQuestions";
import AdminCompetitionResults from "./pages/admin/AdminCompetitionResults";
import Competitions from "./pages/Competitions";
import CompetitionEntry from "./pages/CompetitionEntry";
import CompetitionQuiz from "./pages/CompetitionQuiz";
import NotFound from "./pages/NotFound";
import Navigation from "./pages/Navigation";
import Leaderboard from "./pages/Leaderboard";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path={"/?"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/auth/callback"} component={AuthCallback} />
      <Route path={"/events"} component={Events} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/stories"} component={Stories} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/events"} component={AdminEvents} />
      <Route path={"/admin/gallery"} component={AdminGallery} />
      <Route path={"/admin/stories"} component={AdminStories} />
      <Route path={"/admin/messages"} component={AdminMessages} />
      <Route path={"/admin/users"} component={AdminUserManagement} />
      <Route path={"/admin/competitions"} component={AdminCompetitions} />
      <Route path={"/admin/competitions/:id/questions"} component={AdminCompetitionQuestions} />
      <Route path={"/admin/competitions/:id/results"} component={AdminCompetitionResults} />
      <Route path={"/competitions"} component={Competitions} />
      <Route path={"/competitions/:id/enter"} component={CompetitionEntry} />
      <Route path={"/competitions/:id/quiz"} component={CompetitionQuiz} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <Toaster />
            <Navigation />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
