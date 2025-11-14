"use client";
import Image from "next/image";
import QRGenerator from "./components/QRGenerator";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-20 sm:px-12">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center gap-4 mb-12">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="h-12 w-12 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg"
          >
            M
          </motion.div>
          <span className="text-4xl font-bold bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Musealum
          </span>
        </motion.div>

        {/* Main Content */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.2 }} className="flex flex-col items-center text-center gap-8 mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-gray-900 dark:text-white max-w-3xl">
            Discover Culture.
            <span className="block bg-linear-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Anytime. Anywhere.</span>
          </h1>

          <p className="max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Musealum brings museum collections to your fingertips. Explore artifacts, exhibitions, and timelines through an interactive digital experience.
          </p>

          {/* CTA Buttons */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mt-8">
            <motion.a
              href="explore"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-14 items-center justify-center rounded-full bg-linear-to-r from-red-600 to-red-700 px-10 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              🔍 Explore Now
            </motion.a>

            <motion.a
              href="register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-14 items-center justify-center rounded-full border-2 border-red-600 px-10 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors"
            >
              ✨ Get Started
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Features Preview */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {[
            { icon: "🎨", title: "Rich Collections", desc: "Browse thousands of curated artifacts" },
            { icon: "📱", title: "Interactive", desc: "Engage with 3D models and timelines" },
            { icon: "🌍", title: "Global Access", desc: "Explore museums from around the world" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Musealum — Preserving culture, one artifact at a time.
        </motion.div>
      </main>
    </div>
  );
}
