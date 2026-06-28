import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import "./admin.css";

export const dynamic = "force-dynamic";

type ContentField = {
  id: string;
  section_key: string;
  setting_key: string;
  label: string;
  input_type: "text" | "textarea" | "url" | "number";
  sort_order: number | null;
};

type SiteSetting = {
  key: string;
  value: string;
};

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

async function updateSectionSettings(formData: FormData) {
  "use server";

  const supabase = await requireAdmin();

  const sectionKey = String(formData.get("section_key") || "");

  if (!sectionKey) {
    return;
  }

  const { data: fields, error: fieldsError } = await supabase
    .from("content_fields")
    .select("setting_key")
    .eq("section_key", sectionKey)
    .eq("is_active", true);

  if (fieldsError || !fields) {
    return;
  }

  const rows = fields.map((field) => ({
    key: field.setting_key,
    value: String(formData.get(field.setting_key) || ""),
    updated_at: new Date().toISOString(),
  }));

  await supabase.from("site_settings").upsert(rows, {
    onConflict: "key",
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/features");
}

function groupFieldsBySection(fields: ContentField[]) {
  return fields.reduce<Record<string, ContentField[]>>((acc, field) => {
    if (!acc[field.section_key]) {
      acc[field.section_key] = [];
    }

    acc[field.section_key].push(field);

    return acc;
  }, {});
}

function getSectionTitle(sectionKey: string) {
  return sectionKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function AdminPage() {
  const supabase = await requireAdmin();

  const { data: fieldsData, error: fieldsError } = await supabase
    .from("content_fields")
    .select("id, section_key, setting_key, label, input_type, sort_order")
    .eq("is_active", true)
    .order("section_key", { ascending: true })
    .order("sort_order", { ascending: true });

  const fields = (fieldsData || []) as ContentField[];

  const settingKeys = fields.map((field) => field.setting_key);

  const { data: settingsData, error: settingsError } = settingKeys.length
    ? await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", settingKeys)
    : { data: [], error: null };

  const settings = (settingsData || []) as SiteSetting[];

  const settingsMap = Object.fromEntries(
    settings.map((setting) => [setting.key, setting.value])
  );

  const fieldsBySection = groupFieldsBySection(fields);

  return (
    <main className="adminPage">
      <section className="adminHero">
        <p className="adminEyebrow">Admin Panel</p>
        <h1>Website Content Management</h1>
        <p>
          Edit the website content here. After saving, the frontend updates from
          Supabase automatically.
        </p>
      </section>

      {fieldsError && (
        <section className="adminSection">
          <p className="adminError">{fieldsError.message}</p>
        </section>
      )}

      {settingsError && (
        <section className="adminSection">
          <p className="adminError">{settingsError.message}</p>
        </section>
      )}

      {Object.entries(fieldsBySection).map(([sectionKey, sectionFields]) => (
        <section className="adminSection" key={sectionKey}>
          <div className="adminSectionHeader">
            <div>
              <p className="adminEyebrow">Website Section</p>
              <h2>{getSectionTitle(sectionKey)}</h2>
            </div>

            <span className="adminCount">{sectionFields.length} fields</span>
          </div>

          <form action={updateSectionSettings} className="adminContentForm">
            <input type="hidden" name="section_key" value={sectionKey} />

            {sectionFields.map((field) => (
              <label className="adminField" key={field.id}>
                <span>{field.label}</span>
                <small>{field.setting_key}</small>

                {field.input_type === "textarea" ? (
                  <textarea
                    name={field.setting_key}
                    defaultValue={settingsMap[field.setting_key] || ""}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    name={field.setting_key}
                    type={field.input_type === "number" ? "number" : "text"}
                    defaultValue={settingsMap[field.setting_key] || ""}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </label>
            ))}

            <button type="submit">Save {getSectionTitle(sectionKey)}</button>
          </form>
        </section>
      ))}

      {fields.length === 0 && (
        <section className="adminSection">
          <p className="adminEmpty">
            No content fields found. Add rows into the content_fields table.
          </p>
        </section>
      )}
    </main>
  );
}