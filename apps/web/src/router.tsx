import { createBrowserRouter } from "react-router";
import AppShell from "./app-shell";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AddProduct from "./pages/AddProduct";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import EditProduct from "./pages/EditProduct";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ManageOrders from "./pages/ManageOrders";
import ManageProducts from "./pages/ManageProducts";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <ProtectedRoute><Checkout /></ProtectedRoute> },
      { path: "my-orders", element: <ProtectedRoute><MyOrders /></ProtectedRoute> },
      { path: "orders/:id", element: <ProtectedRoute><OrderDetails /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "admin", element: <AdminRoute><AdminDashboard /></AdminRoute> },
      { path: "admin/products", element: <AdminRoute><ManageProducts /></AdminRoute> },
      { path: "admin/products/add", element: <AdminRoute><AddProduct /></AdminRoute> },
      { path: "admin/products/edit/:id", element: <AdminRoute><EditProduct /></AdminRoute> },
      { path: "admin/orders", element: <AdminRoute><ManageOrders /></AdminRoute> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
