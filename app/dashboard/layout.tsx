"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log(user);
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  if (!isAuthorized) {
    // You can render a loading spinner or a blank screen here
    // while the authorization check is in progress.
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
