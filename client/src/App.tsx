import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BettingTerminal from "@/pages/betting-terminal";
import NotFound from "@/pages/not-found";
import { BetProvider } from "@/components/bet-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BettingTerminal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BetProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </BetProvider>
    </QueryClientProvider>
  );
}

export default App;
