"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Loader } from "@/components/dashboard/loader";
import PwaHelper from "@/lib/pwa-helper";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <PwaHelper />
      <DashboardClient />
    </>
  );
}
