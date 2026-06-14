"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const products = [
  { id: 1, name: "Physiotherapy Exercise Guide", price: 350, category: "Books", emoji: "📖", desc: "Complete guide to home physiotherapy exercises for arthritis and back pain patients.", rating: 4.8, sold: 120 },
  { id: 2, name: "Pain Relief Gel (50g)", price: 280, category: "Medicine", emoji: "💊", desc: "Doctor-recommended topical pain relief gel for joint and muscle pain.", rating: 4.6, sold: 340 },
  { id: 3, name: "Knee Support Brace", price: 850, category: "Equipment", emoji: "🦵", desc: "Adjustable knee support for arthritis, post-surgery recovery, and sports injuries.", rating: 4.7, sold: 89 },
  { id: 4, name: "Cervical Pillow", price: 650, category: "Equipment", emoji: "🛏️", desc: "Orthopedic cervical pillow designed to reduce neck pain and improve sleep quality.", rating: 4.5, sold: 156 },
  { id: 5, name: "Lumbar Support Belt", price: 750, category: "Equipment", emoji: "🫀", desc: "Medical grade lumbar support belt for back pain and posture correction.", rating: 4.8, sold: 203 },
  { id: 6, name: "Arthritis Care Book", price: 420, category: "Books", emoji: "📚", desc: "Comprehensive book on living with arthritis — written by Dr. Jahangir.", rating: 4.9, sold: 78 },
];

const categories = ["All", "Books", "Medicine", "Equipment"];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<number[]>([]);

  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  const addToCart = (id: number) => {
    setCart(prev => [...prev, id]);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#F4F4F5] min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-3">
                  Shop
                </span>
                <h1 className="text-3xl font-bold text-[#191919]">Medical Products & Resources</h1>
                <p className="text-[#A3A3A3] mt-1">Doctor-recommended products for your health journey</p>
              </div>
              {cart.length > 0 && (
                <div className="relative">
                  <button className="bg-[#14967F] text-white rounded-full px-5 py-2.5 font-medium flex items-center gap-2">
                    🛒 Cart ({cart.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category filter */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                  activeCategory === cat ? "bg-[#14967F] text-white" : "bg-white text-[#A3A3A3] hover:text-[#191919]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-44 bg-gradient-to-br from-[#e8f5f2] to-[#d0ede8] flex items-center justify-center">
                  <span className="text-6xl">{product.emoji}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#e8f5f2] text-[#14967F] rounded-full px-3 py-0.5 text-xs font-medium">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FAD069">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-xs text-[#A3A3A3]">{product.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#191919] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#A3A3A3] leading-relaxed mb-4">{product.desc}</p>
                  <p className="text-xs text-[#A3A3A3] mb-4">{product.sold} sold</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-[#191919]">$ {product.price}</p>
                    <button
                      onClick={() => addToCart(product.id)}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                        cart.includes(product.id)
                          ? "bg-[#e8f5f2] text-[#14967F]"
                          : "bg-[#14967F] text-white hover:bg-[#0d7a66]"
                      }`}
                    >
                      {cart.includes(product.id) ? "In Cart ✓" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
