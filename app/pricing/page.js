import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata = {
  title: "TaxMate - Pricing",
  description: "View our simple and transparent pricing plans for TaxMate",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <Pricing />
      <Footer />
    </main>
  );
} 