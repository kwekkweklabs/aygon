import Navbar from "@/components/play/Navbar";
import { AygonSDKProvider } from "@/lib/aygon-sdk/context";
import AuthProvider from "@/providers/AuthProvider";
import { PrivyProvider } from "@privy-io/react-auth";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          accentColor: "#344cb7",
          theme: "#101827",
          showWalletLoginFirst: false,
          logo: "https://i.ibb.co.com/TBy7nndr/aygon-logo.png",
          walletChainType: "ethereum-and-solana",
          walletList: [
            "detected_wallets",
            "phantom",
            "solflare",
            "backpack",
            "okx_wallet",
          ],
        },
        loginMethods: [
          "email",
          // "google"
        ],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
        embeddedWallets: {
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
          ethereum: {
            createOnLogin: "off",
          },
          solana: {
            createOnLogin: "off",
          },
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <AuthProvider>
        <AygonSDKProvider>
          <Navbar />
          <div className="mt-8">
            <Outlet />
          </div>
        </AygonSDKProvider>
      </AuthProvider>
    </PrivyProvider>
  );
}
