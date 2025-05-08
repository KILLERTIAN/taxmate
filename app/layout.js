import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers.js";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TaxMate - Smart Tax Assistant for Freelancers",
  description: "Your intelligent tax management solution for freelancers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(inter.className, "min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800")}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
