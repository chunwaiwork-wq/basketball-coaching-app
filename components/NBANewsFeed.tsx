"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

export default function NBANewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/nba-news");
        const data = await res.json();
        setNews(data.news || []);
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <section className="px-8 py-20" id="nba-news">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl md:text-5xl font-bold text-center mb-4"
        >
          🏀 NBA{" "}
          <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            LATEST
          </span>
        </motion.h2>
        <p className="text-gray-500 text-center text-sm mb-12">
          Latest trades, rumours, and breaking news around the league
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error || news.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>📡 NBA news feed will appear here</p>
            <p className="text-xs mt-2">(Powered by ESPN & Bleacher Report)</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {news.map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="group bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">🏀</span>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">
                      {item.snippet}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-medium text-blue-400/70 uppercase tracking-wider">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {timeAgo(item.pubDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          Headlines from ESPN & Bleacher Report &middot; Updates automatically
        </p>
      </div>
    </section>
  );
}
