import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { userProfile } from "../feature/auth/Slices/profileSlice";

const useGetUserRole = () => {
  const role = localStorage.getItem("role");
  return role ?? null;
};

const useGetUserToken = () => {
  const token = localStorage.getItem("token");
  return token ?? null;
};

export const ProtectedRoute = ({ allowedRoles }) => {
  const dispatch = useDispatch();

  const userRole = useGetUserRole();
  const storedToken = useGetUserToken();

  useEffect(() => {
    if (storedToken && userRole) {
      dispatch(userProfile(storedToken));
    }
  }, [storedToken, userRole, dispatch]);

  if (!storedToken) {
    return <Navigate to="/login" />;
  }

  const isAllowed = allowedRoles.some(
    (role) => role.toLowerCase() === userRole?.toLowerCase()
  );

  if (isAllowed) {
    console.log("allowed if");
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
}
