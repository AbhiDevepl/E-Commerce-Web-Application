import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-semibold"
        >
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=P";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-indigo-600 font-medium">{formatCurrency(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-400 hover:text-red-600 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-3 mt-3">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/products"
            className="block w-full text-center text-indigo-600 py-2 mt-2 text-sm hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
