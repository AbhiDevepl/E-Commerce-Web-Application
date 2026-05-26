import { User, Mail, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              user?.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {user?.role === "admin" ? "Administrator" : "Customer"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Full Name</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Account Role</p>
              <p className="font-medium text-gray-800 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t flex gap-3">
          <Link to="/my-orders" className="flex-1 text-center bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            My Orders
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="flex-1 text-center bg-purple-600 text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors">
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
