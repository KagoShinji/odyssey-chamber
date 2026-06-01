import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {!isAdminPage && <Navbar />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

export default MainLayout;
