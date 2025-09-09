import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import "./DashboardLayout.css";
import { useSelector } from "react-redux";

const DashboardLayout = () => {
  const { isPageLoading } = useSelector((state) => state.global);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile when resizing to desktop
      if (!mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className={`dashboard-main`}>
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="dashboard-content">
          {isPageLoading && <div className="content-loader">Loading...</div>}
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
