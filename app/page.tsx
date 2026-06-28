import react from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Navbar"

import Features from "@/components/features/page"

export default function HomePage() {
  return (
    <main >
      <Header/>
      <h1>Healthy Paw</h1>
      <p>Website is running.</p>
      <Link href="/admin">Admin</Link>
      <Link href="/hotels">Hotels</Link>
      <br />
      <Link href="/services">Services</Link>
    <Features/>
      <Footer />
    </main>
    
  );
}