import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated) {
          setIsAuth(true);
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.push("/signin");
      }
    }

    checkAuth();
  }, [router]);

  if (isAuth === null) return <p>Checking authentication...</p>;

  return <h1>Welcome to your Dashboard</h1>;
}
