"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/app/components/Navbar";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type Product = {
  id: string;
  product_name: string;
  farmer_name: string;
  price: number;
  unit: string;
  quantity_available: number;
  description: string;
  image_url: string;
  category?: string; // Optional if not present in all rows
  location: {
    district: string;
    state: string;
  };
  contact: {
    phone: string;
  };
  posted_date: string;
};

export default function RetailerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

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
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("posted_date", { ascending: false });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }

  // --- Derived State for Filters ---
  const locations = useMemo(() => {
    const locs = new Set(products.map((p) => p.location?.state).filter(Boolean));
    return ["All", ...Array.from(locs)];
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.farmer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchLocation = selectedLocation === "All" || p.location?.state === selectedLocation;

    return matchSearch && matchCategory && matchLocation;
  });

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-16">
        
        {/* === LEFT SIDEBAR (Filters) === */}
        <aside className="w-full md:w-80 bg-white md:bg-transparent z-40 border-b md:border-b-0 md:border-r border-neutral-200 sticky top-16 md:h-[calc(100vh-64px)] overflow-y-auto no-scrollbar p-6 flex-shrink-0">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                        <Icon icon="mdi:store-search-outline" className="w-6 h-6"/>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800">Retailer Hub</h1>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed">Source fresh livestock directly from verified farmers.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Search</label>
                    <div className="relative">
                        <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5"/>
                        <input 
                            type="text" 
                            placeholder="Product or Farmer name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Category</label>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    selectedCategory === cat 
                                    ? 'bg-white border-2 border-blue-500 text-blue-700 shadow-md' 
                                    : 'bg-white border border-transparent text-neutral-600 hover:bg-neutral-100'
                                }`}
                            >
                                <span>{cat === 'All' ? 'All Categories' : cat}</span>
                                {selectedCategory === cat && <Icon icon="mdi:check-circle" className="w-4 h-4 text-blue-500"/>}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">State</label>
                    <div className="relative">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full appearance-none px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all shadow-sm cursor-pointer"
                        >
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>{loc === "All" ? "All States" : loc}</option>
                            ))}
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"/>
                    </div>
                </div>
            </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Available Stock</h2>
                    <p className="text-neutral-500 text-sm mt-1">
                        Showing {filteredProducts.length} items based on your filters
                    </p>
                </div>
            </div>

            {loading ? (
               <div className="flex flex-col items-center justify-center py-20">
                  <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-blue-600 mb-4"/>
                  <p className="text-neutral-500">Loading marketplace...</p>
               </div>
            ) : filteredProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                      <Icon icon="mdi:package-variant-closed" className="w-10 h-10"/>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800">No Products Found</h3>
                  <p className="text-neutral-500 max-w-xs mx-auto mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
                  <button onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedLocation("All")}} className="mt-4 text-blue-600 font-bold hover:underline text-sm">Clear Filters</button>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div 
                        className="group bg-white rounded-2xl border border-neutral-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden cursor-pointer"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img
                            src={p.image_url}
                            alt={p.product_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {p.category && (
                             <div className="absolute top-3 right-3">
                                <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm uppercase tracking-wide text-neutral-800">
                                   {p.category}
                                </span>
                             </div>
                          )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-2">
                             <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                {p.product_name}
                             </h3>
                             <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 mt-1">
                                <Icon icon="mdi:map-marker" className="text-neutral-400"/>
                                <span className="truncate">{p.location?.district}, {p.location?.state}</span>
                             </div>
                          </div>

                          <p className="text-sm text-neutral-600 line-clamp-2 mb-4 flex-1">
                             {p.description}
                          </p>

                          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                             <div>
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Price</p>
                                <p className="text-lg font-bold text-green-700">₹{p.price} <span className="text-xs text-neutral-500 font-medium">/{p.unit}</span></p>
                             </div>
                             <div className="text-right">
                                <span className="inline-block px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-600">
                                   Qty: {p.quantity_available}
                                </span>
                             </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                   {p.farmer_name.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-neutral-600 truncate max-w-[100px]">{p.farmer_name}</span>
                             </div>
                             <button className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:underline">
                                Details <Icon icon="mdi:arrow-right" className="w-3 h-3"/>
                             </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            )}
        </main>
      </div>

      {/* === PRODUCT DETAIL MODAL === */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56 bg-gray-100">
                 <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.product_name}
                    className="w-full h-full object-cover"
                 />
                 <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                 >
                    <Icon icon="mdi:close" className="w-5 h-5"/>
                 </button>
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                    <h3 className="text-2xl font-bold text-white leading-tight">{selectedProduct.product_name}</h3>
                    <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                       <Icon icon="mdi:map-marker" className="w-3 h-3"/> {selectedProduct.location?.district}, {selectedProduct.location?.state}
                    </p>
                 </div>
              </div>

              <div className="p-6 md:p-8">
                 <div className="flex justify-between items-center mb-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <div>
                       <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Total Price</p>
                       <p className="text-xl font-black text-green-700">₹{selectedProduct.price} <span className="text-sm font-medium text-neutral-400">/{selectedProduct.unit}</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Available</p>
                       <p className="text-lg font-bold text-neutral-800">{selectedProduct.quantity_available} {selectedProduct.unit}</p>
                    </div>
                 </div>

                 <div className="mb-8">
                    <h4 className="text-sm font-bold text-neutral-900 mb-2">Description</h4>
                    <p className="text-sm text-neutral-600 leading-relaxed bg-white text-justify">
                       {selectedProduct.description}
                    </p>
                 </div>

                 <div className="border-t border-neutral-100 pt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                            {selectedProduct.farmer_name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Sold By</p>
                            <p className="font-bold text-neutral-900">{selectedProduct.farmer_name}</p>
                        </div>
                    </div>

                    <a
                      href={`tel:${selectedProduct.contact?.phone}`}
                      className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Icon icon="mdi:phone" className="w-5 h-5" />
                      Contact Farmer
                    </a>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}