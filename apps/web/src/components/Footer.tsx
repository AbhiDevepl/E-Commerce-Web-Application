import { Store } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Store className="w-5 h-5" />
            ShopEase
          </div>
          <p className="text-sm">Your one-stop shop for everything you need.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/products" className="hover:text-white">Products</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link to="/my-orders" className="hover:text-white">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm mt-8 border-t border-gray-800 pt-6">
        © {new Date().getFullYear()} ShopEase. Built for college project.
      </div>
    </footer>
  );
}
