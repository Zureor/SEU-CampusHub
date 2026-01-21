import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RegistrationProvider } from "@/contexts/RegistrationContext";
import { InterestedEventsProvider } from "@/contexts/InterestedEventsContext";
import { ProtectedRoute, AdminRoute } from "@/components/guards/ProtectedRoute";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { AnimatedBackdrop } from "@/components/effects/AnimatedBackdrop";

import Home from "@/pages/Home";
import Events from "@/pages/Events";
import UpcomingEvents from "@/pages/UpcomingEvents";
import EventDetail from "@/pages/EventDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import InterestedEvents from "@/pages/InterestedEvents";
import MyRegistrations from "@/pages/MyRegistrations";
import PastEvents from "@/pages/PastEvents";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import CreateEvent from "@/pages/admin/CreateEvent";
import AdminCategories from "@/pages/admin/AdminCategories";
import SuperUserUsers from "@/pages/admin/SuperUserUsers";
import EventRegistrations from "@/pages/admin/EventRegistrations";
import AllRegistrations from "@/pages/admin/AllRegistrations";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Feedback from "@/pages/Feedback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";


import ScrollToTop from "@/components/layout/ScrollToTop";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={Terms} />
        <Route path="/events" component={Events} />
        <Route path="/upcoming-events" component={UpcomingEvents} />
        <Route path="/event/:id" component={EventDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />


        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/interested-events">
          <ProtectedRoute>
            <InterestedEvents />
          </ProtectedRoute>
        </Route>

        <Route path="/my-registrations">
          <ProtectedRoute>
            <MyRegistrations />
          </ProtectedRoute>
        </Route>

        <Route path="/past-events">
          <ProtectedRoute>
            <PastEvents />
          </ProtectedRoute>
        </Route>

        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>

        <Route path="/admin">
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </Route>

        <Route path="/admin/events">
          <AdminRoute>
            <AdminEvents />
          </AdminRoute>
        </Route>

        <Route path="/admin/events/create">
          <AdminRoute>
            <CreateEvent />
          </AdminRoute>
        </Route>

        <Route path="/admin/events/edit/:id">
          <AdminRoute>
            <CreateEvent />
          </AdminRoute>
        </Route>

        <Route path="/admin/categories">
          <AdminRoute>
            <AdminCategories />
          </AdminRoute>
        </Route>

        <Route path="/admin/events/:id/registrations">
          <AdminRoute>
            <EventRegistrations />
          </AdminRoute>
        </Route>

        <Route path="/admin/users">
          <AdminRoute>
            <SuperUserUsers />
          </AdminRoute>
        </Route>

        <Route path="/admin/registrations">
          <AdminRoute>
            <AllRegistrations />
          </AdminRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RegistrationProvider>
            <InterestedEventsProvider>
              <TooltipProvider>
                <CursorGlow />
                <AnimatedBackdrop />
                <Toaster />
                <Router />
              </TooltipProvider>
            </InterestedEventsProvider>
          </RegistrationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
