import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import "./login.css";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

async function sendAdminCode(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect("/login?error=missing_email");
  }

  if (!isAllowedAdminEmail(email)) {
    redirect("/login?error=not_admin");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("OTP SEND ERROR:", error);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

async function verifyAdminCode(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const token = String(formData.get("token") || "").trim();

  if (!email || !token) {
    redirect("/login?error=missing_code");
  }

  if (!isAllowedAdminEmail(email)) {
    redirect("/login?error=not_admin");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    redirect(`/login?sent=1&email=${encodeURIComponent(email)}&error=invalid_code`);
  }

  const adminSupabase = createAdminClient();

  await adminSupabase.from("profiles").upsert(
    {
      id: data.user.id,
      role: "admin",
    },
    {
      onConflict: "id",
    }
  );

  redirect("/admin");
}

type LoginPageProps = {
  searchParams: Promise<{
    sent?: string;
    email?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const sent = params.sent === "1";
  const email = params.email || "";
  const error = params.error || "";

  return (
    <main className="loginPage">
      <section className="loginCard">
        <p className="loginEyebrow">Admin Login</p>

        {!sent ? (
          <>
            <h1>Enter your email</h1>
            <p className="loginText">
              We will send a one-time admin login code to your email.
            </p>

            {error === "not_admin" && (
              <p className="loginError">This email is not allowed for admin access.</p>
            )}

            {error === "send_failed" && (
              <p className="loginError">Could not send the code. Try again.</p>
            )}

            {error === "missing_email" && (
              <p className="loginError">Please enter your email.</p>
            )}

            <form action={sendAdminCode} className="loginForm">
              <label>
                Email
                <input name="email" type="email" required />
              </label>

              <button type="submit">Send Code</button>
            </form>
          </>
        ) : (
          <>
            <h1>Enter code</h1>
            <p className="loginText">
              A one-time code was sent to <strong>{email}</strong>.
            </p>

            {error && (
              <p className="loginError">{error}</p>
            )}

            {error === "missing_code" && (
              <p className="loginError">Please enter the code.</p>
            )}

            <form action={verifyAdminCode} className="loginForm">
              <input type="hidden" name="email" value={email} />

              <label>
                Code
                <input
                  name="token"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </label>

              <button type="submit">Open Admin Panel</button>
            </form>

            <form action={sendAdminCode} className="loginSecondaryForm">
              <input type="hidden" name="email" value={email} />
              <button type="submit">Send New Code</button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}