import { Package, ShoppingBag, Users, TrendingUp, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Loader from "../components/Loader";
import { fetchAllOrders } from "../services/orderService";
import { fetchProducts } from "../services/productService";
import { formatCurrency } from "../utils/formatCurrency";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllOrders(), fetchProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), Icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Orders", value: orders.length, Icon: ShoppingBag, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Products", value: products.length, Icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Pending Orders", value: pendingOrders, Icon: Users, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <Link
          to="/admin/products"
          className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
        >
          <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Manage Products</p>
            <p className="text-sm text-gray-500">Add, edit, or delete products</p>
          </div>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
        >
          <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Manage Orders</p>
            <p className="text-sm text-gray-500">View and update order status</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-indigo-600 text-sm hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 5).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">{order.user?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.orderStatus === "Delivered" ? "bg-green-100 text-green-700" :
                      order.orderStatus === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      order.orderStatus === "Cancelled" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
