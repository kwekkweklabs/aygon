import { Button } from "@heroui/react";
import AnimateComponent from "@/components/elements/AnimateComponent";
import { ArrowUpRight } from "lucide-react";

export default function IndexPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center text-black px-5">
      <div className="flex flex-col items-center gap-6">
        <AnimateComponent>
          <h1 className="text-3xl font-bold text-primary bg-secondary px-3 py-2 rounded-lg">
            🐤 KwekKwek Web Starter
          </h1>
        </AnimateComponent>
        <AnimateComponent delay={0.1}>
          <p className="text-secondary font-medium tracking-tight">
            Cut your damn initiating codebase time
          </p>
        </AnimateComponent>
        <AnimateComponent delay={0.2}>
          <Button
            variant="solid"
            color="primary"
            className="flex items-center gap-1 text-black"
          >
            Get Started
            <ArrowUpRight className="size-4" />
          </Button>
        </AnimateComponent>
      </div>
    </div>
  );
}
