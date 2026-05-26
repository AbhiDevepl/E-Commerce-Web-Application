import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useCart } from "../context/CartContext";
import { fetchProductById } from "../services/productService";
import { formatCurrency } from "../utils/formatCurrency";
import { toast } from "sonner";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    fetchProductById(id)
      .then(setProduct)
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
    });
    toast.success("Added to cart!");
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Message variant="error">{error}</Message>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/products" className="flex items-center gap-2 text-indigo-600 hover:underline mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-2xl shadow-sm border p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Product";
          }}
        />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-2">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3 mb-4">
            <Package className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="text-3xl font-bold text-indigo-600 mb-6">
            {formatCurrency(product.price)}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
