import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export const metadata = {
  title: "TaxMate - How It Works",
  description: "Learn how TaxMate works to simplify your tax management process",
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <HowItWorks />
      <Footer />
    </main>
  );
} 