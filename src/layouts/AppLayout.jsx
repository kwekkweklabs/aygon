import AuthProvider from "@/providers/AuthProvider";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
