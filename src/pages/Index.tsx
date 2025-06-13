
import { useState } from "react";
import { LandingPage } from "../components/LandingPage";
import { AdminLogin } from "../components/AdminLogin";
import { AdminPanel } from "../components/AdminPanel";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "adminLogin" | "adminPanel">("landing");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentView("adminPanel");
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView("landing");
  };

  if (currentView === "adminLogin") {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin} 
        onBack={() => setCurrentView("landing")}
      />
    );
  }

  if (currentView === "adminPanel" && isAdminLoggedIn) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <LandingPage 
      onAdminClick={() => setCurrentView("adminLogin")} 
    />
  );
};

export default Index;
