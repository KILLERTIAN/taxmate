"use client";

import { motion } from "framer-motion";
import { Upload, Shield, FileText, Calculator, Clock, CheckCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Easy Document Upload",
      description:
        "Upload your tax documents in any format - PDF, JPEG, or images. Our system handles everything automatically.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Smart Validation",
      description:
        "Automatic validation of GSTIN, PAN, and other important details to ensure accuracy and compliance.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Categorization",
      description:
        "Intelligent categorization of your documents into income, expenses, and other relevant categories.",
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Tax Calculations",
      description:
        "Automatic calculation of your tax liability based on your income and eligible deductions.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Deadline Reminders",
      description:
        "Never miss a tax deadline with our smart reminder system for important dates and filings.",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Compliance Checks",
      description:
        "Regular compliance checks to ensure your documents meet all legal requirements and standards.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
          >
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Smart Tax Management
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Everything you need to manage your taxes efficiently and stay compliant with
            the latest regulations.
          </motion.p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 