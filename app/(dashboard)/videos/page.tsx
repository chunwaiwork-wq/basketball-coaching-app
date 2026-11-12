"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const categories = [
  { id: "DRIBBLING", label: "Dribbling Drills", icon: "🏀", color: "from-[#C65A24]/20 to-[#C65A24]/5 border-[#C65A24]/20" },
  { id: "SHOOTING", label: "Shooting Drills", icon: "🎯", color: "from-[#C65A24]/20 to-[#A34717]/5 border-[#C65A24]/20" },
  { id: "PLAYS", label: "Breakdown of Plays", icon: "📋", color: "from-[#E9DFC9]/20 to-[#C65A24]/5 border-[#E9DFC9]/20" },
  { id: "SKILLSETS", label: "Skillsets Drills", icon: "⚡", color: "from-[#C65A24]/20 to-[#A34717]/5 border-[#C65A24]/20" },
];

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("DRIBBLING");

  return (
    <main className="min-h-screen bg-[#171717] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C65A24]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#E9DFC9] mb-2">
            TRAINING{" "}
            <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
              VIDEOS
            </span>
          </h1>
          <p className="text-[#E9DFC9]/70 mb-10">Master your game with pro-level drills</p>
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
                  ? "bg-[#E9DFC9] text-[#171717] shadow-lg"
                  : "bg-[#E9DFC9]/5 text-[#E9DFC9]/70 hover:text-[#E9DFC9] border border-[#E9DFC9]/10"
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
              className="bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden cursor-pointer group"
            >
              <div className="aspect-video bg-gradient-to-br from-[#E9DFC9]/12 to-[#E9DFC9]/4 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <span className="text-5xl opacity-30">🎬</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#E9DFC9] mb-1">Drill Video {i}</h3>
                <p className="text-[#E9DFC9]/55 text-sm">{activeCategory} training</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}