import { ShoppingCart, Store, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <Store className="w-6 h-6" />
          ShopEase
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium hidden sm:block">
            Products
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium hidden sm:flex"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link
                to="/my-orders"
                className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium hidden sm:flex"
              >
                <Package className="w-4 h-4" />
                Orders
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Register
              </Link>
            </>
          )}

          <Link to="/cart" className="relative flex items-center text-gray-600 hover:text-indigo-600">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
