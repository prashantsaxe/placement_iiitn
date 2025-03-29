import { useState } from "react";
import { useRouter } from "next/router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    const res = await fetch(`/api/auth/magic-link?email=${email}`, { method: "POST" });
    const data = await res.json();

    if (data.success) {
      router.push(data.redirect); // Redirect to dashboard after login
    } else {
      setError(data.error || "Failed to sign in");
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
      <button onClick={handleSignIn}>Sign In</button>
      {error && <p>{error}</p>}
    </div>
  );
}
