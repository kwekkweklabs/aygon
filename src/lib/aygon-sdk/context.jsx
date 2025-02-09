import { createContext, useContext, useEffect, useState } from "react";
import { AygonSDK } from ".";

function useSDK() {
  const [sdk, setSDK] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const sdkInstance = new AygonSDK();
      setSDK(sdkInstance);
    } catch (err) {
      setError(err);
      console.error("Failed to initialize SDK:", err);
    }
  }, []);

  return { sdk, error };
}
const SDKContext = createContext({ sdk: null });

export function AygonSDKProvider({ children }) {
  const { sdk, error } = useSDK();

  if (error) {
    return <div>Error initializing SDK: {error.message}</div>;
  }

  return <SDKContext.Provider value={{ sdk }}>{children}</SDKContext.Provider>;
}

/**
 *
 * @returns {{ sdk:AygonSDK}}
 */
export function useAygonSDK() {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error("useSDKContext must be used within an SDKProvider");
  }
  return sdk;
}
