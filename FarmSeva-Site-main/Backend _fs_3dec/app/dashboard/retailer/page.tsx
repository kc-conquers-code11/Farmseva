"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/app/components/Navbar";
import { Icon } from "@iconify/react";

export default function RetailerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);


  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const currentUser = data.user;
      setUser(currentUser);

      const role = currentUser.user_metadata.role;

      if (role !== "retailer") {
        alert("Access denied. Retailers only.");
        window.location.href = "/";
        return;
      }

      loadAllProducts();
    }

    init();
  }, []);

  async function loadAllProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("posted_date", { ascending: false });

    if (!error) setProducts(data);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto pt-20 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Retailer Dashboard
        </h1>

        <p className="text-gray-600 mb-10">
          View all products added by farmers across the platform.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition"
              >
                <div className="h-40 mb-4">
                  <img
                    src={p.image_url}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {p.product_name}
                </h2>

                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Icon icon="mdi:map-marker" className="w-4 h-4" />
                  {p.location?.district}, {p.location?.state}
                </p>

                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {p.description}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-green-700 font-bold text-lg">
                    ₹{p.price}
                  </span>

                  <span className="text-sm text-gray-500">
                    {p.quantity_available} {p.unit}
                  </span>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  Added by: <strong>{p.farmer_name}</strong>
                  <button
    onClick={() => setSelectedProduct(p)}
    className="mt-3 w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
  >
    <Icon icon="mdi:phone" className="w-4 h-4" />
    Contact
  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
{selectedProduct && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Product Details
        </h2>
        <button
          onClick={() => setSelectedProduct(null)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <Icon icon="mdi:close" className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* PRODUCT IMAGE */}
      <div className="w-full h-56 bg-gray-100">
        <img
          src={selectedProduct.image_url}
          className="w-full h-full object-cover"
        />
      </div>

      {/* PRODUCT INFO */}
      <div className="p-6 space-y-4 text-sm">

        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {selectedProduct.product_name}
          </h3>
          <p className="text-gray-600">{selectedProduct.description}</p>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Icon icon="mdi:map-marker" className="w-5 h-5" />
          {selectedProduct.location?.district}, {selectedProduct.location?.state}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-green-700">
            ₹{selectedProduct.price} / {selectedProduct.unit}
          </span>
          <span className="text-gray-800">
            Qty: {selectedProduct.quantity_available}
          </span>
        </div>

        <div>
          <p className="font-medium text-gray-900">Farmer:</p>
          <p>{selectedProduct.farmer_name}</p>
        </div>

        <div>
          <p className="font-medium text-gray-900">Contact:</p>
          <p className="text-lg font-bold">{selectedProduct.contact?.phone}</p>
        </div>

        {/* CALL BUTTON */}
        <a
          href={`tel:${selectedProduct.contact?.phone}`}
          className="mt-4 w-full block text-center bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700"
        >
          Call Farmer
        </a>

      </div>
    </div>
  </div>
)}


    </div>

        

  );
}
