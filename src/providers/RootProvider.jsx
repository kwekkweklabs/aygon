import { HeroUIProvider } from "@heroui/react";
import QueryProvider from "./QueryProvider";
import { ParallaxProvider } from "react-scroll-parallax";

export default function RootProvider({ children }) {
  return (
    <ParallaxProvider>
      <HeroUIProvider>
        <QueryProvider>{children}</QueryProvider>
      </HeroUIProvider>
    </ParallaxProvider>
  );
}
