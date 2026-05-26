import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { fetchProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((data) => setFeatured(data.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Shop Everything You Need
          </h1>
          <p className="text-indigo-200 text-lg mb-8">
            Discover thousands of products at unbeatable prices with fast delivery.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { Icon: Truck, title: "Free Delivery", desc: "On orders over $50" },
          { Icon: Shield, title: "Secure Payment", desc: "100% protected" },
          { Icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
          { Icon: ShoppingBag, title: "Easy Returns", desc: "30 day return policy" },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4 bg-white border rounded-xl p-5 shadow-sm">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Icon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{title}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <Link to="/products" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-indigo-50 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Ready to start shopping?</h2>
        <p className="text-gray-500 mb-6">Create an account and enjoy exclusive deals.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
