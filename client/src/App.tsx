import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initTelegramApp, getTelegramChatId } from "@/lib/telegram";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import AdminSettings from "@/pages/AdminSettings";
import NotFound from "@/pages/not-found";
import { Home, Archive, Settings } from "lucide-react";

function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const chatId = getTelegramChatId();
  const adminChatId = import.meta.env.VITE_ADMIN_CHAT_ID || '';
  const isAdmin = chatId === adminChatId;

  const navItems = [
    { path: '/', icon: Home, label: 'Главная', testId: 'nav-dashboard' },
    { path: '/history', icon: Archive, label: 'История', testId: 'nav-history' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', icon: Settings, label: 'Настройки', testId: 'nav-admin' });
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom"
      data-testid="bottom-navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover-elevate'
              }`}
              data-testid={item.testId}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Router() {
  const chatId = getTelegramChatId();
  const adminChatId = import.meta.env.VITE_ADMIN_CHAT_ID || '';
  const isAdmin = chatId === adminChatId;

  return (
    <div className="pb-16">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/history" component={History} />
        {isAdmin && <Route path="/admin" component={AdminSettings} />}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initTelegramApp();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
          <BottomNavigation />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
