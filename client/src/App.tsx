import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Movements from "./pages/Movements";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Reports from "./pages/Reports";

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path={"/products"}>
        <DashboardLayout>
          <Products />
        </DashboardLayout>
      </Route>
      <Route path={"/categories"}>
        <DashboardLayout>
          <Categories />
        </DashboardLayout>
      </Route>
      <Route path={"/movements"}>
        <DashboardLayout>
          <Movements />
        </DashboardLayout>
      </Route>
      <Route path={"/alerts"}>
        <DashboardLayout>
          <Alerts />
        </DashboardLayout>
      </Route>
      <Route path={"/history"}>
        <DashboardLayout>
          <History />
        </DashboardLayout>
      </Route>
      <Route path={"/reports"}>
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
