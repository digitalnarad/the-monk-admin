import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Tags,
  Users,
  Settings,
  ChevronDown,
  Plus,
  Kanban,
  Dot,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(["products"]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      path: "/products",
      subItems: [
        { label: "All Products", path: "/products", icon: null },
        { label: "Add Product", path: "/products/add", icon: Plus },
      ],
    },
    {
      id: "categories",
      label: "Categories",
      icon: FolderOpen,
      path: "/categories",
    },
    {
      id: "tags",
      label: "Tags",
      icon: Tags,
      path: "/tags",
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      path: "/users",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const isActiveItem = (item) => {
    if (item.subItems) {
      return item.subItems.some(
        (subItem) => location.pathname === subItem.path
      );
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Package size={24} className="logo-icon" />
            <span className="logo-text">Monk Lab</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveItem(item);
            const isExpanded = expandedItems.includes(item.id);

            return (
              <div key={item.id} className="nav-item-wrapper">
                <div
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (item.subItems) {
                      toggleExpanded(item.id);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                >
                  <div className="nav-item-content">
                    <IconComponent size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </div>

                  {item.subItems && (
                    <ChevronDown
                      size={16}
                      className={`nav-arrow ${isExpanded ? "expanded" : ""}`}
                    />
                  )}
                </div>

                {item.subItems && isExpanded && (
                  <div className="nav-subitems">
                    {item.subItems.map((subItem, index) => {
                      const SubItemIcon = subItem.icon;
                      return (
                        <div
                          key={index}
                          className={`nav-subitem mt-2 ${
                            location.pathname === subItem.path ? "active" : ""
                          }`}
                          onClick={() => handleNavigation(subItem.path)}
                        >
                          {subItem.icon && (
                            <SubItemIcon size={16} className="nav-subicon" />
                          )}
                          <span className="nav-sublabel">{subItem.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              <Users size={16} />
            </div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
