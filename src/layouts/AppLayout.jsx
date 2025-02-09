import { AygonSDKProvider } from "@/lib/aygon-sdk/context";
import AuthProvider from "@/providers/AuthProvider";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <AuthProvider>
      <AygonSDKProvider>
        <Outlet />
      </AygonSDKProvider>
    </AuthProvider>
  );
}
