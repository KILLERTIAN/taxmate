import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export const metadata = {
  title: "TaxMate - Features",
  description: "Discover the powerful features of TaxMate that help freelancers manage their taxes efficiently",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <Features />
      <Footer />
    </main>
  );
} 