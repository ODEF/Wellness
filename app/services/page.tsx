import { createClient } from "../../lib/supabase/server";

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Services</h1>
        <p>Could not load services.</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Wellness Services</h1>

      <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
        {services?.map((service) => (
          <article
            key={service.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <strong>${service.price}</strong>
          </article>
        ))}
      </div>
    </main>
  );
}