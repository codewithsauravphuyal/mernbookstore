import { Navigate, Outlet } from "react-router-dom";

const AdminRoutes = ({ children }) => {
  const token = localStorage.getItem("token"); // Retrieve the token
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null; // Decode JWT payload

  // If no token or role isn't admin, redirect to login
  if (!user) {
    return <Navigate to="/admin"/>
  }

  // If authenticated, render the child 
  return children?children:<Outlet/>
};

export default AdminRoutes;
