import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { fetchMyOrders } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {error ? (
        <Message variant="error">{error}</Message>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You haven't placed any orders yet.</p>
          <Link to="/products" className="text-indigo-600 hover:underline mt-2 inline-block">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.orderItems.length}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
