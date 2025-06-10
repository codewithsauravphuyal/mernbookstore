import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home/Home";
import Register from "../components/Register";
import CartBook from "../pages/books/CartBook";
import CheckOut from "../pages/books/CheckOut";
import SingleBook from "../pages/books/SingleBook";
import Orders from "../pages/books/Orders";
import ManageBook from "../pages/DashBoard/ManageBook/ManageBook";
import AddBook from "../pages/DashBoard/AddBook/AddBook";
import AdminLogin from "../components/AdminLogin";
import Login from "../components/Login";
import PrivateRoutes from "./PrivateRoutes";
import DashboardLayout from "../pages/DashBoard/DashBoardLayout";
import UpdateBook from "../pages/DashBoard/EditBook/UpdateBook";
import Dashboard from "../pages/DashBoard/DashBoard";
import AdminRoutes from "./AdminRoutes";
import AboutUs from "../components/AboutUs";
import ExploreBook from "../components/ExploreBook";
import UserList from "../pages/DashBoard/UserList";
import OrderList from "../pages/DashBoard/OrderList";
import OrderDetails from "../pages/DashBoard/OrderDetails";
import ReviewList from "../pages/DashBoard/ReviewList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/explore-books",
        element: <ExploreBook />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/cart",
        element: <CartBook />,
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoutes>
            <CheckOut />
          </PrivateRoutes>
        ),
      },
      {
        path: "/books/:id",
        element: <SingleBook />,
      },
      {
        path: "/orders",
        element: (
          <PrivateRoutes>
            <Orders />
          </PrivateRoutes>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/dashboard",
    element: (
      <AdminRoutes>
        <DashboardLayout />
      </AdminRoutes>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "add-new-book",
        element: <AddBook />,
      },
      {
        path: "edit-book/:id",
        element: <UpdateBook />,
      },
      {
        path: "manage-books",
        element: <ManageBook />,
      },
      {
        path: "manage-users",
        element: <UserList />,
      },
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/:id",
        element: <OrderDetails />,
      },
      {
        path: "reviews",
        element: <ReviewList />,
      },
      {
        path: "orders/*",
        element: <Navigate to="/dashboard/orders" replace />,
      },
    ],
  },
]);

export default router;