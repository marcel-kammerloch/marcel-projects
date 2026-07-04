import { useAuth } from "@repo/auth/client";
import type { ReactNode } from "react";

export default function AdminOnly({
  children,
}: {
  children: Readonly<ReactNode>;
}) {
  const { isAdmin } = useAuth();

  return isAdmin && children;
}
