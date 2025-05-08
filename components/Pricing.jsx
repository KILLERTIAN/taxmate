"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: "Free",
      price: {
        monthly: 0,
        annually: 0,
      },
      description: "Perfect for freelancers just starting out",
      features: [
        "Upload up to 50 documents",
        "Basic document categorization",
        "Manual tax calculations",
        "Email support",
        "Access to basic tax guides",
      ],
      notIncluded: [
        "AI-powered document processing",
        "Automatic tax calculations",
        "Priority support",
        "Advanced reporting",
      ],
      cta: "Get Started",
      mostPopular: false,
    },
    {
      name: "Pro",
      price: {
        monthly: 19,
        annually: 15,
      },
      description: "For growing freelance businesses",
      features: [
        "Upload up to 500 documents",
        "AI-powered document processing",
        "Automatic tax calculations",
        "Real-time compliance checks",
        "Priority email support",
        "Expense tracking",
        "Basic API access",
      ],
      notIncluded: [
        "Advanced reporting",
        "Dedicated account manager",
      ],
      cta: "Try Pro",
      mostPopular: true,
    },
    {
      name: "Enterprise",
      price: {
        monthly: 49,
        annually: 39,
      },
      description: "For established freelance businesses",
      features: [
        "Unlimited document uploads",
        "Advanced AI document processing",
        "Automatic tax calculations",
        "Real-time compliance checks",
        "Priority phone & email support",
        "Dedicated account manager",
        "Advanced reporting",
        "Full API access",
        "Custom integrations",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      mostPopular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
          >
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Choose the plan that works best for your freelance business needs
          </motion.p>
          
          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full w-fit">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !isAnnual
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  isAnnual
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Annual <span className="text-green-500 font-semibold">-20%</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 grid gap-8 lg:grid-cols-3"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className={`relative flex flex-col rounded-2xl ${
                tier.mostPopular
                  ? "ring-2 ring-blue-500 dark:ring-blue-400"
                  : "ring-1 ring-gray-200 dark:ring-gray-700"
              } bg-white dark:bg-gray-800 shadow-sm p-8`}
            >
              {tier.mostPopular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 transform">
                  <span className="inline-flex rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {tier.description}
                </p>
              </div>
              
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  ${isAnnual ? tier.price.annually : tier.price.monthly}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {tier.price.monthly === 0 ? "" : isAnnual ? "/month, billed annually" : "/month"}
                </span>
              </div>
              
              <div className="space-y-4 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Includes:</p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {tier.notIncluded.length > 0 && (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-4">Not included:</p>
                    <ul className="space-y-3">
                      {tier.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <X className="h-5 w-5 text-red-500 shrink-0 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              <Button
                className={`mt-8 w-full ${
                  tier.mostPopular
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                }`}
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Enterprise section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 sm:p-10"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white">
              Need a custom solution?
            </h3>
            <p className="mt-2 text-blue-100">
              Contact our sales team to get a custom plan tailored to your specific needs.
            </p>
            <Button className="mt-6 bg-white text-blue-600 hover:bg-blue-50">
              Contact Sales
            </Button>
          </div>
        </motion.div>
        
        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes, all paid plans come with a 14-day free trial, no credit card required."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
              },
              {
                question: "How secure is my data?",
                answer: "Your data is encrypted both in transit and at rest. We use industry-standard security practices and never share your data with third parties."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-left p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 