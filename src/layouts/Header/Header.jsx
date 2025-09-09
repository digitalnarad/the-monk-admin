import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, User, LogOut, Settings, Bell, Search } from "lucide-react";
import { Button } from "../../components/common";
import "./Header.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/globalSlice";

const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const { authData } = useSelector((state) => state.global);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // State manage
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = [{ name: "Dashboard", path: "/dashboard" }];

    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
      if (name !== "dashboard") {
        breadcrumbs.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          path: routeTo,
        });
      }
    });

    return breadcrumbs;
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="header">
      <div className="header-left">
        <Button
          variant="ghost"
          size="small"
          onClick={onMenuToggle}
          className="menu-toggle"
          startIcon={<Menu size={20} />}
        />

        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator">/</span>}
              <button
                className={`breadcrumb-link ${
                  index === breadcrumbs.length - 1 ? "active" : ""
                }`}
                onClick={() => navigate(crumb.path)}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="header-center">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
      <div className="header-right">
        <Button
          variant="ghost"
          size="small"
          className="notification-btn"
          startIcon={<Bell size={18} />}
        />

        <div className="profile-dropdown">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="profile-btn"
            startIcon={<User size={18} />}
          />

          {isProfileOpen && (
            <div className="profile-menu">
              <div className="profile-info">
                <div className="profile-avatar">
                  <User size={24} />
                </div>
                <div className="profile-details">
                  <div className="profile-name">Admin User</div>
                  <div className="profile-email">{authData?.email}</div>
                </div>
              </div>

              <div className="profile-menu-divider" />

              <button
                className="profile-menu-item"
                onClick={() => navigate("/profile")}
              >
                <User size={16} />
                Profile
              </button>

              <button
                className="profile-menu-item"
                onClick={() => navigate("/settings")}
              >
                <Settings size={16} />
                Settings
              </button>

              <div className="profile-menu-divider" />

              <button
                className="profile-menu-item logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
