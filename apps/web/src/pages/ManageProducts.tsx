import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { fetchProducts, deleteProduct } from "../services/productService";
import { formatCurrency } from "../utils/formatCurrency";
import { toast } from "sonner";

export default function ManageProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        </div>
        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/48x48?text=P";
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock > 0 ? "text-green-600" : "text-red-500"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
