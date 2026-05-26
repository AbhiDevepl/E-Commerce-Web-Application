import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x300?text=Product";
          }}
        />
        <span className="absolute top-2 left-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
          {product.category}
        </span>
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-indigo-600 font-bold text-lg">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">{product.stock} in stock</p>
      </div>
    </Link>
  );
}
