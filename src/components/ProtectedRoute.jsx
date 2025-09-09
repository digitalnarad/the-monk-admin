import { Navigate, Outlet } from "react-router-dom";
import storage from "../services/storage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { verifyToken } from "../store/globalSlice";

const ProtectedRoute = () => {
  // Check if user is authenticated
  const dispatch = useDispatch();
  const { authToken, authData } = useSelector((state) => state.global);

  const isAuthenticated = Boolean(authToken);

  useEffect(() => {
    if (authToken && !authData) {
      dispatch(verifyToken(authToken));
    }
  }, [authToken, authData]);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
