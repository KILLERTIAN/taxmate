"use client";

import { motion } from "framer-motion";
import { Upload, FileText, Calculator, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload Documents",
      description:
        "Start by uploading your tax-related documents like invoices, receipts, and identification proof. We support PDF, JPEG, and image formats.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Processing",
      description:
        "Our AI-powered system processes your documents, extracts relevant information, and categorizes them automatically.",
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Tax Calculations",
      description:
        "The system calculates your tax liability, identifies eligible deductions, and generates accurate tax estimates.",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Review & Export",
      description:
        "Review the generated reports, make any necessary adjustments, and export them in your preferred format.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
          >
            How TaxMate{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            A simple, four-step process to manage your taxes efficiently and stay compliant.
          </motion.p>
        </div>

        <div className="mt-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-cyan-500" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 