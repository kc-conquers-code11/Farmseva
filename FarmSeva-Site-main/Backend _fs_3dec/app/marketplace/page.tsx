"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Navbar from "@/app/components/Navbar";
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
  <div className="flex justify-between items-center py-1">
    <div className="flex items-center gap-2 text-gray-600">
      <Icon icon={icon} className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </div>
    <span
      className={`font-semibold ${
        isPrice ? "text-green-600 text-base" : "text-gray-800"
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
    price: "0",
    quantityAvailable: "0",
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
      price: "0",
      quantityAvailable: "0",
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* === HEADER & ACTION BUTTON === */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Buy and sell Pig & Poultry stock directly.</p>
          </div>

          <div className="flex gap-3">
             <button
                onClick={handleAddStockClick}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Icon icon="mdi:plus-circle" className="w-6 h-6" />
                Add Pig / Poultry Stock
              </button>
          </div>
        </div>

        {/* === SEARCH & FILTERS === */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-20 z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
                <option value="All">All Categories</option>
                <option value="Pig">Pig / Swine</option>
                <option value="Poultry">Poultry / Chicken</option>
            </select>
            <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
                ))}
            </select>
          </div>
        </div>

        {/* === PRODUCT GRID === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />

                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                      {product.category}
                    </span>
                  </div>
                  {product.verified && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                      <Icon icon="mdi:check-decagram" /> Verified
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{product.product_name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Icon icon="mdi:map-marker" className="w-4 h-4" /> {product.location.district}, {product.location.state}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-bold text-green-700">₹{product.price} <span className="text-xs font-normal text-gray-500">/ {product.unit}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Qty</p>
                      <p className="text-sm font-semibold text-gray-800">{product.quantity_available}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
  {/* <button
    onClick={() => setSelectedProduct(product)}
    className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800"
  >
    <Icon icon="mdi:phone" className="w-4 h-4" /> Contact
  </button> */}

  {product.user_id === user?.id && (
    <button
      onClick={() => handleDeleteProduct(product.id)}
      className="w-10 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700"
    >
      <Icon icon="mdi:delete" className="w-5 h-5" />
    </button>
  )}
</div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
             <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:basket-off" className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">No products found</h3>
          </div>
        )}

        {/* === ADD STOCK MODAL === */}
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsAddModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Add Stock (Pig/Poultry)</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                      <Icon icon="mdi:close" className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-4">
                    {/* CATEGORY SELECTION */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                      <select 
                          name="category" 
                          value={newProduct.category} 
                          onChange={handleInputChange} 
                          className="w-full p-2 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500"
                      >
                          <option value="Poultry">Poultry (Chicken/Eggs)</option>
                          <option value="Pig">Pig / Swine</option>
                      </select>
                    </div>

                    {/* ✅ FIXED: IMAGE UPLOAD INPUT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (Optional)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2.5"
                        />
                      </div>
                      {/* Image Preview */}
                      {newProduct.tempImageUrl && (
                        <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                          <img src={newProduct.tempImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                      <input type="text" name="productName" placeholder="e.g., Yorkshire Piglets (8 weeks)" required value={newProduct.productName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input type="number" name="price" placeholder="0" required value={newProduct.price} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input type="text" name="unit" placeholder="kg/pc" required value={newProduct.unit} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
                        <input type="number" name="quantityAvailable" placeholder="0" required value={newProduct.quantityAvailable} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <input type="tel" name="phone" placeholder="+91..." required value={newProduct.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                      </div>
                    </div>

                      <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <input type="text" name="district" required value={newProduct.district} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" name="state" required value={newProduct.state} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea name="description" rows={3} placeholder="Describe health, vaccination status, breed..." required value={newProduct.description} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg"/>
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                      Post Stock to Market
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Modal (ENHANCED) */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
                    <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-gray-100 rounded-full">
                      <Icon icon="mdi:close" className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Farmer Info Block */}
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold">
                        {selectedProduct.farmer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedProduct.farmer_name}</p>
                        <p className="text-xs text-gray-600">{selectedProduct.farm_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* NEW: Detailed Product/Listing Info */}
                  <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Product & Listing Details</h4>
  
                  <div className="space-y-3 mb-6 text-sm">
                    <DetailRow
                      icon="mdi:tag"
                      label="Product Name"
                      value={selectedProduct.product_name}
                    />

                    <DetailRow
                      icon="mdi:scale"
                      label="Quantity Available"
                      value={`${selectedProduct.quantity_available} ${selectedProduct.unit}`}
                    />

                    <DetailRow
                      icon="mdi:currency-inr"
                      label="Price"
                      value={`₹${selectedProduct.price} / ${selectedProduct.unit}`}
                      isPrice
                    />

                    <DetailRow
                      icon="mdi:map-marker-outline"
                      label="Location"
                      value={`${selectedProduct.location.district}, ${selectedProduct.location.state}`}
                    />

                    <DetailRow
                      icon="mdi:calendar-range"
                      label="Posted On"
                      value={new Date(selectedProduct.posted_date).toLocaleDateString()}
                    />
                  </div>

                  {/* END NEW DETAILS */}

                  <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Farmer Contact</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Icon icon="mdi:phone" className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase font-bold">Phone Number</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.contact.phone}</p>
                      </div>
                      <a href={`tel:${selectedProduct.contact.phone}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700">Call</a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}