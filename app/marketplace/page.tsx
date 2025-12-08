"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ----------------------------------------------------------------------
// HELPER COMPONENT: Detail Row for Contact Modal
// ----------------------------------------------------------------------
const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  isPrice?: boolean;
}> = ({ icon, label, value, isPrice = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3 text-neutral-500">
      <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
         <Icon icon={icon} className="w-4 h-4 text-neutral-600" />
      </div>
      <span className="font-medium text-sm">{label}</span>
    </div>
    <span
      className={`font-semibold text-sm ${
        isPrice ? "text-green-700 text-lg" : "text-neutral-800"
      }`}
    >
      {value}
    </span>
  </div>
);

// -------------------
type Product = {
  id: string;
  user_id: string;
  farmer_name: string;
  farm_name: string;
  location: { state: string; district: string };
  category: "Pig" | "Poultry";
  product_name: string;
  price: number;
  unit: string;
  quantity_available: number;
  description: string;
  image_url: string;
  posted_date: string;
  contact: { phone: string; email?: string };
  verified: boolean;
};

// FORM TYPE
interface NewProductState {
  productName: string;
  category: "Poultry" | "Pig";
  price: string;
  quantityAvailable: string;
  unit: string;
  description: string;
  district: string;
  state: string;
  phone: string;
  tempImageUrl: string;
  imageFile?: File;
}
// -------------------

export default function FarmerMarketplacePage() {
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Category must match your union type "Pig" | "Poultry"
    if (name === "category" && (value === "Pig" || value === "Poultry")) {
      setNewProduct((prev) => ({
        ...prev,
        category: value,
      }));
      return;
    }

    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<NewProductState>({
    productName: "",
    category: "Poultry",
    price: "",
    quantityAvailable: "",
    unit: "kg",
    description: "",
    district: "",
    state: "",
    phone: "",
    tempImageUrl: "",
  });

  const handleAddStockClick = () => {
    setIsAddModalOpen(true);
  };

  // -----------------------------------------------------------
  // 🚀 FETCH USER & ROLE
  // -----------------------------------------------------------
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setUser(null);
        return;
      }

      setUser(data.user);
      setRole(data.user.user_metadata.role || "farmer");

      // fetch products AFTER knowing role
      fetchProducts(data.user.id);
    }
    loadUser();
    
    // Add global styles for custom scrollbar
    const styles = `
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  // -----------------------------------------------------------
  // 🚀 FETCH PRODUCTS SECURELY (Farmers see only their items)
  // -----------------------------------------------------------
  async function fetchProducts(userId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)   // ← HARD filter only the current farmer
      .order("posted_date", { ascending: false });

    if (!error && data) setProducts(data as Product[]);
  }


  // -----------------------------------------------------------
  // ✅ FIXED: IMAGE UPLOAD HANDLER
  // -----------------------------------------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Store the actual File object
    setNewProduct((prev) => ({
      ...prev,
      imageFile: file,
    }));

    // 2. Create a local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct((prev) => ({ ...prev, tempImageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // -----------------------------------------------------------
  // ✅ FIXED: UPLOAD IMAGE TO SUPABASE STORAGE
  // -----------------------------------------------------------
  async function uploadImage(file: File, productId: string) {
    // Clean file extension logic
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}.${fileExt}`;
    // Create a folder per product for organization: ID/filename
    const filePath = `${productId}/${fileName}`;

    // 1. Upload
    const { error: uploadError } = await supabase.storage
      .from("product-images") // ✅ Bucket name matches your instructions
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      return null;
    }

    // 2. Get Public URL
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // -----------------------------------------------------------
  // 🚀 ADD PRODUCT → STORE IN DB
  // -----------------------------------------------------------
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Login required.");
      return;
    }

    const newId = crypto.randomUUID();
    let uploadedImageUrl = null;

    // ✅ Upload image if verified file exists
    if (newProduct.imageFile) {
      uploadedImageUrl = await uploadImage(newProduct.imageFile, newId);
    }

    // Fallback images based on category
    const defaultImage =
      newProduct.category === "Pig"
        ? "https://images.unsplash.com/photo-1604848698030-c434ba08ece1"
        : "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7";

    const finalImageUrl = uploadedImageUrl || defaultImage;

    const payload = {
      id: newId,
      user_id: user.id,
      farmer_name: user.user_metadata.full_name || "Unknown Farmer",
      farm_name: "Registered Farm",
      location: { state: newProduct.state, district: newProduct.district },
      category: newProduct.category,
      product_name: newProduct.productName,
      price: Number(newProduct.price),
      unit: newProduct.unit,
      quantity_available: Number(newProduct.quantityAvailable),
      description: newProduct.description,
      image_url: finalImageUrl,
      posted_date: new Date().toISOString(),
      contact: { phone: newProduct.phone },
      verified: false,
    };

    const { error } = await supabase.from("products").insert(payload);

    if (error) {
      console.error(error);
      alert("Failed to add product. Check console.");
      return;
    }

    // optimistic update
    setProducts((prev) => [payload as Product, ...prev]);
    setIsAddModalOpen(false);

    // reset form
    setNewProduct({
      productName: "",
      category: "Poultry",
      price: "",
      quantityAvailable: "",
      unit: "kg",
      description: "",
      district: "",
      state: "",
      phone: "",
      tempImageUrl: "",
      imageFile: undefined,
    });
  };

  // -----------------------------------------------------------
  // 🚀 DELETE PRODUCT (ONLY OWN PRODUCTS)
  // -----------------------------------------------------------
  const handleDeleteProduct = async (productId: string) => {
    if (!user) {
      alert("Not allowed.");
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    // 1. Delete from DB
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id); // safety check

    if (error) {
      console.error(error);
      alert("Failed to delete product.");
      return;
    }

    // 2. Update UI immediately
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };



  // -----------------------------------------------------------
  // FILTERS
  // -----------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchText =
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.farm_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchLoc = selectedLocation === "All" || p.location.state === selectedLocation;

      return matchText && matchCategory && matchLoc;
    });
  }, [products, searchTerm, selectedCategory, selectedLocation]);

  const locations = useMemo(() => {
    const locs = new Set(products.map((p) => p.location.state));
    return ["All", ...locs];
  }, [products]);

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-32">
        
        {/* === SIDEBAR (FILTERS & ACTIONS) === */}
        <aside className="w-full md:w-80 bg-white md:bg-transparent z-40 border-b md:border-b-0 md:border-r border-neutral-200 sticky top-16 md:h-[calc(100vh-64px)] overflow-y-auto no-scrollbar p-6 flex-shrink-0">
            {/* Header & Primary Action */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                        <Icon icon="mdi:storefront-outline" className="w-6 h-6"/>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800">Marketplace</h1>
                </div>
                <p className="text-neutral-500 text-sm mb-6 leading-relaxed">Directly buy and sell livestock with verified local farmers.</p>
                
                <button
                    onClick={handleAddStockClick}
                    className="w-full bg-neutral-900 hover:bg-black text-white p-4 rounded-xl font-bold shadow-xl shadow-neutral-900/10 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                    <Icon icon="mdi:plus-circle" className="w-5 h-5" />
                    Sell Your Stock
                </button>
            </div>

            {/* Filters */}
            <div className="space-y-8">
                {/* Search */}
                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Search</label>
                    <div className="relative">
                        <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5"/>
                        <input 
                            type="text" 
                            placeholder="Find pigs, poultry..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-medium transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Categories</label>
                    <div className="space-y-2">
                        {['All', 'Pig', 'Poultry'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    selectedCategory === cat 
                                    ? 'bg-white border-2 border-green-500 text-green-700 shadow-md' 
                                    : 'bg-white border border-transparent text-neutral-600 hover:bg-neutral-100'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory === cat ? 'bg-green-100' : 'bg-neutral-100'}`}>
                                        <Icon icon={cat === 'All' ? 'mdi:apps' : cat === 'Pig' ? 'mdi:pig' : 'mdi:bird'} className={`w-5 h-5 ${selectedCategory === cat ? 'text-green-600' : 'text-neutral-500'}`}/>
                                    </div>
                                    {cat === 'All' ? 'All Categories' : cat}
                                </div>
                                {selectedCategory === cat && <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500"/>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Locations */}
                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Location</label>
                    <div className="relative">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full appearance-none px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-medium transition-all shadow-sm cursor-pointer"
                        >
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
                            ))}
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"/>
                    </div>
                </div>
            </div>
        </aside>

        {/* === MAIN CONTENT AREA === */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
             
             {/* Dynamic Content Header */}
             <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">
                        {selectedCategory === 'All' ? 'All Listings' : `${selectedCategory} Listings`}
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Showing {filteredProducts.length} results based on your filters
                    </p>
                </div>
             </div>

             {/* Listings Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div 
                        onClick={() => setSelectedProduct(product)}
                        className="group bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden cursor-pointer"
                      >
                        {/* Image Section */}
                        <div className="relative h-52 bg-gray-100 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.product_name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="absolute top-3 right-3 flex gap-2">
                             <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm uppercase tracking-wide text-neutral-700">
                               {product.category}
                             </span>
                          </div>
                          
                          {product.verified && (
                            <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                              <Icon icon="mdi:check-decagram" /> Verified
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-green-700 transition-colors">{product.product_name}</h3>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mt-1">
                              <Icon icon="mdi:map-marker" className="text-neutral-400" /> 
                              <span className="truncate">{product.location.district}, {product.location.state}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-neutral-600 line-clamp-2 mb-4 flex-1">{product.description}</p>
                          
                          <div className="pt-4 border-t border-neutral-100 flex items-end justify-between">
                            <div>
                              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
                              <p className="text-xl font-bold text-neutral-900">₹{product.price}<span className="text-sm text-neutral-500 font-medium">/{product.unit}</span></p>
                            </div>
                            <div className="text-right">
                               <span className="inline-block px-2 py-1 bg-neutral-100 rounded text-xs font-semibold text-neutral-600">
                                  Qty: {product.quantity_available}
                               </span>
                            </div>
                          </div>

                          {/* Owner Actions */}
                          {product.user_id === user?.id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                              className="mt-4 w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                              <Icon icon="mdi:delete-outline" className="w-4 h-4" /> Remove Listing
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                ))}
             </div>

             {/* Empty State */}
             {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                        <Icon icon="mdi:basket-off-outline" className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">No Listings Found</h3>
                    <p className="text-neutral-500 max-w-sm">
                        We couldn't find any products matching your current filters. Try adjusting your search or category.
                    </p>
                    <button onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedLocation("All")}} className="mt-6 text-green-600 font-bold hover:underline">
                        Clear all filters
                    </button>
                </div>
             )}
        </main>
      </div>

      {/* === ADD STOCK MODAL === */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-bold text-neutral-900">List New Stock</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <Icon icon="mdi:close" className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                <form onSubmit={handleAddProduct} className="space-y-6">
                  {/* Category Toggle */}
                  <div className="p-1 bg-neutral-100 rounded-xl flex gap-1">
                     {['Poultry', 'Pig'].map((cat) => (
                        <button
                            type="button"
                            key={cat}
                            onClick={() => setNewProduct(prev => ({...prev, category: cat as any}))}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${newProduct.category === cat ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <Icon icon={cat === 'Pig' ? 'mdi:pig' : 'mdi:bird'} className="w-4 h-4"/> {cat}
                        </button>
                     ))}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Product Image</label>
                    <div className="flex items-start gap-4">
                        <div className={`w-24 h-24 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden bg-neutral-50 relative ${!newProduct.tempImageUrl ? 'hover:border-green-500 hover:bg-green-50 transition-colors' : ''}`}>
                            {newProduct.tempImageUrl ? (
                                <img src={newProduct.tempImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Icon icon="mdi:camera-plus" className="w-8 h-8 text-neutral-400" />
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1 text-sm text-neutral-500 pt-2">
                            <p>Upload a clear photo of your livestock.</p>
                            <p className="text-xs mt-1 text-neutral-400">Supported: JPG, PNG (Max 5MB)</p>
                        </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Product Title</label>
                        <input type="text" name="productName" placeholder="e.g., Healthy Yorkshire Piglets" required value={newProduct.productName} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Price (₹)</label>
                          <input type="number" name="price" placeholder="0" required value={newProduct.price} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                        </div>
                        <div className="w-1/3">
                          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Unit</label>
                          <input type="text" name="unit" placeholder="kg/pc" required value={newProduct.unit} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Quantity</label>
                          <input type="number" name="quantityAvailable" placeholder="Available stock" required value={newProduct.quantityAvailable} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Phone</label>
                          <input type="tel" name="phone" placeholder="+91..." required value={newProduct.phone} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">District</label>
                          <input type="text" name="district" placeholder="e.g. Pune" required value={newProduct.district} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">State</label>
                          <input type="text" name="state" placeholder="e.g. Maharashtra" required value={newProduct.state} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"/>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Description</label>
                        <textarea name="description" rows={3} placeholder="Details about breed, age, vaccination status..." required value={newProduct.description} onChange={handleInputChange} className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium resize-none"/>
                      </div>
                  </div>

                  <button type="submit" className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Post Listing
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === CONTACT MODAL === */}
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
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-2xl font-bold text-neutral-900">{selectedProduct.product_name}</h3>
                      <p className="text-neutral-500 text-sm">{selectedProduct.farm_name}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                    <Icon icon="mdi:close" className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                
                {/* Farmer Info Block */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-xl shadow-sm border border-green-100">
                    {selectedProduct.farmer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Farmer</p>
                    <p className="font-bold text-neutral-900 text-lg">{selectedProduct.farmer_name}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 mb-8">
                  <DetailRow icon="mdi:tag-outline" label="Category" value={selectedProduct.category} />
                  <DetailRow icon="mdi:scale" label="Quantity" value={`${selectedProduct.quantity_available} ${selectedProduct.unit}`} />
                  <DetailRow icon="mdi:currency-inr" label="Price" value={`₹${selectedProduct.price} / ${selectedProduct.unit}`} isPrice />
                  <DetailRow icon="mdi:map-marker-outline" label="Location" value={`${selectedProduct.location.district}, ${selectedProduct.location.state}`} />
                  <DetailRow icon="mdi:calendar-clock" label="Posted" value={new Date(selectedProduct.posted_date).toLocaleDateString()} />
                </div>

                <div className="space-y-3">
                    <a href={`tel:${selectedProduct.contact.phone}`} className="w-full bg-neutral-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
                        <Icon icon="mdi:phone" className="w-5 h-5" /> Call Farmer
                    </a>
                    <button className="w-full bg-white border border-neutral-200 text-neutral-700 py-3.5 rounded-xl font-bold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                        <Icon icon="mdi:whatsapp" className="w-5 h-5 text-green-600" /> Chat on WhatsApp
                    </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}