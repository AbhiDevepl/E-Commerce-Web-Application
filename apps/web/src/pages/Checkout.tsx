import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "Cash on Delivery",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const order = await placeOrder({
        orderItems: cart.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
        totalPrice,
      });
      clearCart();
      navigate(`/orders/${order._id}?success=1`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Shipping Address</h3>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Street Address", name: "address", placeholder: "123 Main St" },
                { label: "City", name: "city", placeholder: "New York" },
                { label: "Postal Code", name: "postalCode", placeholder: "10001" },
                { label: "Country", name: "country", placeholder: "United States" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Payment Method</h3>
            {["Cash on Delivery", "Demo Payment"].map((method) => (
              <label key={method} className="flex items-center gap-3 mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={form.paymentMethod === method}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                <span className="text-gray-700">{method}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Placing order..." : `Place Order · ${formatCurrency(totalPrice)}`}
          </button>
        </form>

        {/* Summary */}
        <div className="bg-white border rounded-xl p-5 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Order Items</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center gap-3 text-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=P";
                  }}
                />
                <span className="flex-1 truncate">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 mt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
