"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userEmail = searchParams.get("userEmail");
    const userRole = searchParams.get("userRole");

    if (userId && userName && userEmail && userRole) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userRole", userRole);
      // Also set the keys the dashboard layout checks for
      localStorage.setItem("studentId", userId);
      localStorage.setItem("studentName", userName);

      if (userRole === "coach") {
        localStorage.setItem("isCoach", "true");
      }

      router.push("/dashboard/videos");
    } else {
      router.push("/auth/login?error=callback_failed");
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#030303] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-blue-400 mx-auto mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-400">Signing you in...</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400">Signing you in...</p>
        </div>
      </main>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
