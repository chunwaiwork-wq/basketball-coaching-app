"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const categories = [
  { id: "PAST", label: "Past Training Videos", icon: "📼" },
  { id: "ALL", label: "All Videos", icon: "🎬" },
  { id: "DRIBBLING", label: "Dribbling", icon: "🏀" },
  { id: "SHOOTING", label: "Shooting", icon: "🎯" },
  { id: "PLAYS", label: "Plays", icon: "📋" },
  { id: "SKILLSETS", label: "Skillsets", icon: "⚡" },
];

interface Video {
  id: number;
  title: string;
  url: string;
  category: string;
}

function VideoCard({ video, index }: { video: Video; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.url}`, '_blank')}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 relative">
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-white mb-1">{video.title}</h3>
        <p className="text-gray-500 text-sm">{video.category}</p>
      </div>
    </motion.div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const name = localStorage.getItem("studentName");
    setStudentName(name || "Athlete");

    if (studentId) {
      fetch(`/api/videos?studentId=${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          setVideos(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filteredVideos = activeCategory === "ALL" 
    ? videos 
    : videos.filter((v) => v.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-gray-400 text-sm mb-1">Welcome back, {studentName}</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            YOUR{" "}
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              VIDEOS
            </span>
          </h1>
          <p className="text-gray-400 mb-10">Your personal training library</p>
        </motion.div>

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

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🎬</span>
            <p className="text-gray-400 mt-4">No videos in this category yet.</p>
            <p className="text-gray-600 text-sm mt-1">Your coach will upload videos soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}