import { ArrowLeft, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { fetchOrderById } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isSuccess = searchParams.get("success") === "1";

  useEffect(() => {
    if (!id) return;
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/my-orders" className="flex items-center gap-2 text-indigo-600 hover:underline mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-sm">Thank you for your purchase. We'll process it shortly.</p>
          </div>
        </div>
      )}

      {error ? (
        <Message variant="error">{error}</Message>
      ) : order ? (
        <div className="space-y-5">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</div>
              <div><span className="font-medium">Payment:</span> {order.paymentMethod}</div>
              <div><span className="font-medium">Total:</span> {formatCurrency(order.totalPrice)}</div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Shipping Address</h3>
            <p className="text-gray-600 text-sm">
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Items ({order.orderItems.length})</h3>
            <div className="space-y-3">
              {order.orderItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 text-sm py-2 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/56x56?text=P";
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-gray-800 mt-4 pt-3 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
