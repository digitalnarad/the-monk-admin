import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button, Input, Card } from "../../components/common";
import "./Login.css";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import {
  handelCatch,
  setAuthToken,
  showSuccess,
  throwError,
} from "../../store/globalSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleLogin(values);
    },
  });

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", values);
      if (res.status !== 200) {
        dispatch(throwError(res?.data?.message));
        return null;
      }
      dispatch(setAuthToken(res?.data?.response?.token));
      dispatch(showSuccess(res?.data?.message));
      navigate("/admin/dashboard");
    } catch (error) {
      dispatch(handelCatch(error));
      console.log("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Card className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <LogIn size={32} className="login-logo-icon" />
              <h1 className="login-title">Monk Lab Admin</h1>
            </div>
            <p className="login-subtitle">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="login-form">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />

            <div className="password-input-wrapper">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "password" : "text"}
                placeholder="Enter your password"
                required
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              className="mt-4"
              loading={loading}
              startIcon={<LogIn size={18} />}
            >
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
