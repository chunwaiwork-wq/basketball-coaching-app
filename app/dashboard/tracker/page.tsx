"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Drill {
  id: string;
  name: string;
  category: string;
  duration: string;
  completed: boolean;
  icon: string;
}

export default function TrackerPage() {
  const [drills, setDrills] = useState<Drill[]>([
    { id: "1", name: "Form Shooting", category: "SHOOTING", duration: "15 min", completed: false, icon: "🎯" },
    { id: "2", name: "Cone Dribbling", category: "DRIBBLING", duration: "20 min", completed: false, icon: "🏀" },
    { id: "3", name: "Pick & Roll Reads", category: "PLAYS", duration: "25 min", completed: false, icon: "📋" },
    { id: "4", name: "Euro Step Finish", category: "SKILLSETS", duration: "15 min", completed: false, icon: "⚡" },
    { id: "5", name: "Free Throws", category: "SHOOTING", duration: "10 min", completed: false, icon: "🎯" },
    { id: "6", name: "Behind the Back", category: "DRIBBLING", duration: "15 min", completed: false, icon: "🏀" },
  ]);

  const toggleDrill = (id: string) => {
    setDrills(drills.map(drill => 
      drill.id === id ? { ...drill, completed: !drill.completed } : drill
    ));
  };

  const completedCount = drills.filter(d => d.completed).length;
  const progress = (completedCount / drills.length) * 100;

  const getToday = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-gray-400 text-sm mb-2">{getToday()}</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            DRILL{" "}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              TRACKER
            </span>
          </h1>
          <p className="text-gray-400">Tap to clock in your completed drills</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-semibold">Today&apos;s Progress</span>
            <span className="text-gray-400 text-sm">{completedCount}/{drills.length} completed</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            />
          </div>
          {progress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-sm mt-3 text-center font-semibold"
            >
              🏆 ALL DRILLS COMPLETED! GREAT WORK!
            </motion.p>
          )}
        </motion.div>

        {/* Drill List */}
        <div className="space-y-3">
          {drills.map((drill, index) => (
            <motion.div
              key={drill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleDrill(drill.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                drill.completed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      drill.completed
                        ? "bg-green-500 border-green-500"
                        : "border-white/20"
                    }`}
                  >
                    {drill.completed && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{drill.icon}</span>
                      <h3 className={`font-semibold ${drill.completed ? "text-green-400 line-through" : "text-white"}`}>
                        {drill.name}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{drill.category}</p>
                  </div>
                </div>

                <span className="text-gray-400 text-sm">{drill.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => setDrills(drills.map(d => ({ ...d, completed: false })))}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset all drills
          </button>
        </div>
      </div>
    </main>
  );
}