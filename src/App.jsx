import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import { ProductList, ProductForm, ProductView } from "./pages/Products";
import { CategoryList, CategoryForm } from "./pages/Categories";
import { TagList, TagForm } from "./pages/Tags";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/theme.css";
import "./App.css";
import { UserList } from "./pages/Users";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Product Routes */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/add" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductView />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />

              {/* Category Routes */}
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/add" element={<CategoryForm />} />
              <Route path="/categories/edit/:id" element={<CategoryForm />} />

              {/* Tag Routes */}
              <Route path="/tags" element={<TagList />} />
              <Route path="/tags/add" element={<TagForm />} />
              <Route path="/tags/edit/:id" element={<TagForm />} />

              {/* User Routes */}
              <Route path="/users" element={<UserList />} />
            </Route>
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
