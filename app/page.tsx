import react from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer"
export default function HomePage() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Healthy Paw</h1>
      <p>Website is running.</p>
      
      <Link href="/hotels">Hotels</Link>
      <br />
      <Link href="/services">Services</Link>
    </main>
    
  );
}