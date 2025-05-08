"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Shield, FileText, ScanLine } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800" />
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Smart Tax Management for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Freelancers
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Upload your documents, let our AI handle the rest. TaxMate makes tax filing
            simple, accurate, and stress-free for freelancers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white flex items-center">
                <ScanLine className="mr-2 h-5 w-5" />
                Scan & Upload Documents
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-2">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Document upload CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 dark:from-blue-900/30 dark:to-cyan-800/30 rounded-xl p-6 backdrop-blur-sm max-w-4xl mx-auto border border-blue-100 dark:border-blue-900/50"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Start Managing Your Taxes Today
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Upload your invoices, receipts, and tax documents for instant analysis and organization.
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Upload className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Supports PDF, JPG, PNG formats</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <span>AI-powered data extraction</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Shield className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Bank-level security and encryption</span>
                  </li>
                </ul>
              </div>
              <Link href="/dashboard" className="shrink-0">
                <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  Upload Documents
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            {[
              {
                icon: <Upload className="h-6 w-6" />,
                title: "Easy Upload",
                description: "Upload documents in any format - PDF, JPEG, or images",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Smart Validation",
                description: "Automatic validation of GSTIN, PAN, and other details",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Instant Reports",
                description: "Get detailed tax reports and summaries instantly",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 