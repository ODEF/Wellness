import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

type Hotel = {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  price_from: number | null;
  created_at: string;
};

export default async function HotelsPage() {
  const supabase = await createClient();

  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Hotels</h1>
        <p>Could not load hotels.</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Wellness Hotels</h1>

      <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
        {(hotels as Hotel[] | null)?.map((hotel) => (
          <article
            key={hotel.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {hotel.image_url && (
              <img
                src={hotel.image_url}
                alt={hotel.name}
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}

            <h2>{hotel.name}</h2>
            <p>{hotel.location}</p>
            <p>{hotel.description}</p>

            {hotel.price_from && <strong>From ${hotel.price_from}</strong>}

            <div style={{ marginTop: "16px" }}>
              <Link href={`/hotels/${hotel.id}`}>View details</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}