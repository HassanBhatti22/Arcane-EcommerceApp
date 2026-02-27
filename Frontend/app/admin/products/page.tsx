"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Save, Edit, X, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  rating?: number;
  variants?: {
    sizes: string[];
    colors: { name: string; hex: string }[];
  };
}

const COMMON_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Grey", hex: "#808080" },
  { name: "Navy", hex: "#000080" },
  { name: "Beige", hex: "#F5F5DC" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
    category: "Electronics",
    stock: "",
    images: ["", "", ""],
    variants: {
      sizes: [] as string[],
      colors: [] as { name: string; hex: string }[]
    }
  });

  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    console.log(`📸 Image ${index + 1} changed to:`, value);
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
    console.log('📋 Updated formData.images:', newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const method = editingId ? "PUT" : "POST";

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ""), // Filter out empty strings
        variants: formData.variants, // Pass variants
      };

      console.log('🔍 Submitting product data:', productData);
      console.log('📸 Images being sent:', productData.images);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      const savedProduct = await response.json();
      console.log('✅ Product saved:', savedProduct);
      console.log('📸 Saved product images:', savedProduct.images);

      setSuccess(editingId ? "Product updated successfully!" : "Product added successfully!");
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      stock: product.stock.toString(),
      images: [...product.images, "", ""].slice(0, 3), // Ensure 3 images
      variants: product.variants || { sizes: [], colors: [] },
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setSuccess("Product deleted successfully!");
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      price: "",
      description: "",
      category: "electronics",
      stock: "",
      images: ["", "", ""],
      variants: { sizes: [], colors: [] }
    });
    setNewColor({ name: "", hex: "#000000" });
    setEditingId(null);
  };

  // Calculate category counts
  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Product Management</h2>
        <p className="text-xs text-gray-400 font-medium italic">Manage your store inventory</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-sm flex items-center gap-3">
          <div className="text-green-600 font-bold">✓</div>
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-center gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 1. Add/Edit Product Form */}
        <div className="lg:col-span-2 bg-white p-8 border border-gray-100 shadow-sm rounded-sm">
          <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit size={20} className="text-orange-600" /> Edit Product
              </>
            ) : (
              <>
                <Plus size={20} className="text-orange-600" /> Add New Product
              </>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Studio Pro Wireless"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-orange-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. AETHER"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-orange-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Product Description</label>
              <textarea
                rows={4}
                placeholder="Describe the product features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-orange-600 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Price ($)</label>
                <input
                  type="number"
                  placeholder="299"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-orange-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-orange-600 outline-none transition-all cursor-pointer"
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home-living">Home & Living</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Stock Count</label>
                <input
                  type="number"
                  placeholder="50"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  min="0"
                  className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-orange-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* 3 Images Section */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Product Images (3 Required)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.images.map((url, idx) => (
                  <ImageUpload
                    key={idx}
                    value={url}
                    onChange={(newUrl) => handleImageChange(idx, newUrl)}
                    label={`Image ${idx + 1}`}
                    required
                  />
                ))}
              </div>
            </div>

            {/* Fashion Attributes Section */}
            {(formData.category === "fashion" || formData.category === "Fashion") && (
              <div className="bg-gray-50 p-6 rounded-sm space-y-6 border border-gray-200">
                <h4 className="font-bold uppercase tracking-wider text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                  <span className="text-orange-600">★</span> Fashion Attributes
                </h4>

                {/* Sizes */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Available Sizes</label>
                  <div className="flex flex-wrap gap-3">
                    {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                      <label key={size} className={`flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-sm transition-all ${formData.variants?.sizes.includes(size)
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                        <input
                          type="checkbox"
                          checked={formData.variants?.sizes.includes(size)}
                          onChange={() => {
                            const currentSizes = formData.variants?.sizes || [];
                            const newSizes = currentSizes.includes(size)
                              ? currentSizes.filter(s => s !== size)
                              : [...currentSizes, size];
                            setFormData({
                              ...formData,
                              variants: {
                                ...formData.variants,
                                sizes: newSizes,
                                colors: formData.variants?.colors || []
                              }
                            });
                          }}
                          className="accent-orange-600 w-4 h-4"
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>


              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white p-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all group"
              >
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                {editingId ? "Update Product" : "Save Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 bg-gray-200 text-gray-700 p-4 font-bold uppercase tracking-widest hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 2. Side Inventory Info */}
        <div className="space-y-6">
          <div className="bg-black text-white p-6 rounded-sm">
            <h4 className="font-display font-bold text-lg mb-2 text-orange-600">Quick Tip</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Use high-quality Unsplash URLs for product images to maintain the <strong>ARCANE</strong> editorial look. Recommended size is 1000x1000px.
            </p>
          </div>

          <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm">
            <h4 className="font-display font-bold text-lg mb-4 uppercase tracking-tighter">Current Inventory</h4>
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <InventoryItem key={category} label={category} count={count} />
              ))}
              {Object.keys(categoryCounts).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No products yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Products Table */}
      <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm">
        <h3 className="font-display text-xl font-bold mb-6 uppercase tracking-tight">All Products ({products.length})</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No products found. Add your first product above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-widest">
                  <th className="pb-4 font-medium">Image</th>
                  <th className="pb-4 font-medium">Name</th>
                  <th className="pb-4 font-medium">Brand</th>
                  <th className="pb-4 font-medium">Category</th>
                  <th className="pb-4 font-medium">Price</th>
                  <th className="pb-4 font-medium">Stock</th>
                  <th className="pb-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product._id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-sm"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-sm flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-medium">{product.name}</td>
                    <td className="py-4 text-gray-600">{product.brand}</td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 rounded-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 font-bold">${product.price.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`text-xs font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-sm transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-sm transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-sm max-w-md w-full mx-4">
            <h3 className="font-display text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white p-3 font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-700 p-3 font-bold uppercase tracking-widest hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryItem({ label, count }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold">{count}</span>
    </div>
  );
}