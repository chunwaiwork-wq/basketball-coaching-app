"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const categories = [
  { id: "DRIBBLING", label: "Dribbling Drills", icon: "🏀", color: "from-blue-500/20 to-blue-600/5 border-blue-500/20" },
  { id: "SHOOTING", label: "Shooting Drills", icon: "🎯", color: "from-red-500/20 to-red-600/5 border-red-500/20" },
  { id: "PLAYS", label: "Breakdown of Plays", icon: "📋", color: "from-purple-500/20 to-purple-600/5 border-purple-500/20" },
  { id: "SKILLSETS", label: "Skillsets Drills", icon: "⚡", color: "from-green-500/20 to-green-600/5 border-green-500/20" },
];

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("DRIBBLING");

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            TRAINING{" "}
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              VIDEOS
            </span>
          </h1>
          <p className="text-gray-400 mb-10">Master your game with pro-level drills</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all text-sm ${
                activeCategory === cat.id
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Video Grid - Placeholder */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden cursor-pointer group"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <span className="text-5xl opacity-30">🎬</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white mb-1">Drill Video {i}</h3>
                <p className="text-gray-500 text-sm">{activeCategory} training</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}