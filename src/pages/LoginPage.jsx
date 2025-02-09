import StarfieldEffect from "@/components/elements/StarfieldEffect";
import { Button } from "@heroui/react";
import { LoginModal, usePrivy } from "@privy-io/react-auth";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";

export default function LoginPage() {
  const { login } = usePrivy();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full h-screen fixed z-[0]">
        <Canvas>
          <StarfieldEffect />
        </Canvas>
      </div>
      <div className="flex flex-col gap-4 items-center text-center z-20 relative">
        <img src="/aygon-logo.png" alt="" className="w-[16rem] mb-4 z-10" />
        <p className="text-2xl font-semibold">
          <span className="font-light text-sm">
            Battles awaits.
          </span>
          <br />
          <span className="text-2xl">
            Are you ready?
          </span>
        </p>

        <Button
          onPress={login}
          fullWidth
          className="mt-5"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
