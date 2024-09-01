import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AICurbAppeal",
  description: "Elevate your home's exterior design with AI! Whether you're looking to clean up your current look, bring sketches and 3D models to life, or completely redesign for inspiration, our AI-driven platform has you covered. Discover your home's full potential with AICurbAppeal.com.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
