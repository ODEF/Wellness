import { createClient } from "@/lib/supabase/client";
import styles from "./features.module.css";

type Setting = {
  key: string;
  value: string;
};

function getValue(content: Record<string, string>, key: string) {
  return content[key] || "";
}

export default async function Features() {
  const supabase = await createClient();

  const { data: fields } = await supabase
    .from("content_fields")
    .select("setting_key")
    .eq("section_key", "features")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const keys = (fields || []).map((field) => field.setting_key);

  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  const settings = (data || []) as Setting[];

  const content = settings.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresInner}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span />
            {getValue(content, "features_badge_text")}
          </div>

          <h1 className={styles.title}>
            {getValue(content, "features_title_1")}
            <br />
            {getValue(content, "features_title_2")}{" "}
            <span>{getValue(content, "features_title_highlight")}</span>
          </h1>

          <p className={styles.description}>
            {getValue(content, "features_description")}
          </p>

          <div className={styles.actions}>
            <a href="/services" className={styles.primaryButton}>
              {getValue(content, "features_primary_button")}
            </a>

            <a href="/services" className={styles.secondaryButton}>
              {getValue(content, "features_secondary_button")}
              <span>›</span>
            </a>
          </div>

          <div className={styles.rating}>
            <div className={styles.avatars}>
              <span />
              <span />
              <span />
            </div>

            <div>
              <div className={styles.stars}>★★★★★</div>
              <p>
                <strong>{getValue(content, "features_rating_score")}</strong> ·{" "}
                {getValue(content, "features_rating_text")}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.certCard}>
            <div className={styles.certIcon}>♥</div>

            <div>
              <strong>{getValue(content, "features_cert_title")}</strong>
              <p>{getValue(content, "features_cert_subtitle")}</p>
            </div>
          </div>

          <div className={styles.imageWrap}>
            {getValue(content, "features_image_url") && (
              <img
                src={getValue(content, "features_image_url")}
                alt="Dog wellness care"
                className={styles.heroImage}
              />
            )}

            <div className={styles.satisfactionCard}>
              <strong>{getValue(content, "features_satisfaction_rate")}</strong>
              <span>{getValue(content, "features_satisfaction_text")}</span>
            </div>

            <div className={styles.appointmentCard}>
              <div>
                <span>{getValue(content, "features_next_label")}</span>
                <strong>{getValue(content, "features_next_title")}</strong>
                <p>{getValue(content, "features_next_subtitle")}</p>
              </div>

              <div className={styles.scissorIcon}>✂</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}