"use client";

// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { useAuth } from "@/lib/authContext";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // --- 🔒 Firebase Auth disabled for now ---
  // const { user, loading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/");
  //   }
  // }, [loading, user, router]);

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <p className="text-sm text-gray-500">Checking authentication...</p>
  //     </div>
  //   );
  // }

  // if (!user) return null;

  // --- 🟢 Auth OFF: always allow children ---
  return <>{children}</>;
};

export default AuthGuard;
