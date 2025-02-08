import { Marquee } from "@/components/ui/marquee";
import { Fragment } from "react";
import heroBgSrc from "@/assets/hero.jpg";
import jinxSrc from "@/assets/jinx.jpg";
import CharCard from "@/components/landing/CharCard";
import { ArrowDown, Brain, Infinity as InfinityIcon, Zap } from "lucide-react";
import { Link } from "react-router";
import ParallaxImage from "@/components/ui/parallax-image";
import LenisScrollProvider from "@/providers/LenisScrollProvider";
import { Parallax } from "react-scroll-parallax";

const marqueeText = [
  "Build Your Emoji Army",
  "Conquer the Battlefield",
  "AI-Powered Strategy",
  "Outsmart • Outplay • Outlast",
  "Customize Your Squad",
  "Join the Emoji Warfare",
  "Fast-Paced Battles",
  "Compete & Climb the Leaderboards",
  "Upgrade Your Emojis",
  "Prove Your Strategy Skills",
  "Fun • Fast • Fierce",
];

export default function IndexPage() {
  return (
    <>
      <LenisScrollProvider />
      {/* <div className="w-full py-8 flex justify-center fixed top-0 left-0">
        <nav className="rounded-full border border-black p-3 bg-white flex items-center gap-7">
          <div className="border border-black rounded-full px-4 py-2">
            Aygon
          </div>
          <div className="flex items-center gap-4">
            <button>Home</button>
            <button>About</button>
          </div>
          <button className="border border-black rounded-full px-4 py-2 bg-primary flex items-center gap-2">
            Connect Wallet <Wallet className="size-4" />
          </button>
        </nav>
      </div> */}

      <Banner />
      <Hero />
      <Features />
      <Footer />
    </>
  );
}

function Banner() {
  return (
    <div className="w-full h-12 flex items-center relative [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent_100%)]">
      <Marquee className="[--duration:20s]">
        {marqueeText.map((text, index) => (
          <Fragment key={index}>
            <span className="text-sm font-semibold">{text}</span>
            <span className="mb-1">&bull;</span>
          </Fragment>
        ))}
      </Marquee>
    </div>
  );
}

function Hero() {
  return (
    <section className="h-[calc(100vh-48px)] w-full flex flex-col items-center justify-center px-6">
      <div className="rounded-t-[40px] h-full w-full flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,transparent)] size-full">
          <ParallaxImage imageUrl={heroBgSrc} className="size-full" />
        </div>

        {/* <div className="absolute inset-0 size-full bg-gradient-to-t from-blue-500/20 to-transparent"></div> */}

        <div className="w-full flex items-center justify-between p-10 relative">
          <div className="font-bold font-poppins">AYGON</div>
          <div className="font-bold font-poppins flex items-center gap-4">
            <button>Home</button>
            <button>About</button>
          </div>
        </div>
        <div className="flex flex-col items-center mt-28 relative">
          <div className="flex flex-col gap-2">
            <h1 className="font-poppints font-bold text-[6rem] leading-none text-center tracking-tight">
              🎨 Imagine
            </h1>
            <h1 className="font-poppints font-bold text-[6rem] leading-none text-center tracking-tight">
              Create 🛠️
            </h1>
            <h1 className="font-poppints font-bold text-[6rem] leading-none text-center tracking-tight">
              ⚔️ Battle
            </h1>
          </div>
          <Link
            to={"/play"}
            className="mt-8 rounded-full bg-neutral-900 px-6 py-3 border border-white/10"
          >
            <p className="bg-gradient-to-b from-blue-500 to-purple-300 text-transparent bg-clip-text p-1 text-3xl tracking-tight font-bold">
              Play Now
            </p>
          </Link>
        </div>

        <div className="absolute bottom-0 text-white font-poppins rounded-t-2xl px-6 py-6 font-semibold flex items-center gap-2">
          <ArrowDown /> Scroll for more <ArrowDown />
        </div>

        {/* emojis */}
        <div className="text-7xl absolute top-[20%] -translate-y-1/2 right-[30%] -rotate-6">
          👊
        </div>
        <div className="text-7xl absolute bottom-[10%] -translate-y-1/2 left-[30%] -rotate-6">
          🤖
        </div>

        {/* cards */}
        <div className="absolute top-[40%] -translate-y-1/2 left-32 -rotate-6">
          <Parallax speed={-3}>
            <CharCard imageUrl={jinxSrc} />
          </Parallax>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-32 rotate-12">
          <Parallax speed={3}>
            <CharCard
              imageUrl={jinxSrc}
              name="Lumina Flux"
              class="Cosmos Fighter"
            />
          </Parallax>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="w-full min-h-screen bg-black py-20 px-5 flex flex-col items-center justify-center">
      <div className="w-full flex flex-col max-w-6xl items-center space-y-16">
        <h2 className="text-white text-6xl font-poppins font-bold tracking-tight text-center">
          Do whatever you imagine
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-400" />}
            title="Upgrade your hero"
            description="Enhance your character with powerful upgrades and unique abilities. Customize your hero to fit your playstyle and dominate the battlefield."
          />
          <FeatureCard
            icon={<Brain className="w-12 h-12 text-blue-400" />}
            title="AI powered"
            description="Experience intelligent gameplay with our advanced AI system. Adaptive challenges and smart opponents that evolve as you play."
          />
          <FeatureCard
            icon={<InfinityIcon className="w-12 h-12 text-green-400" />}
            title="Endless possibilities"
            description="Explore a vast world with infinite combinations of quests, items, and adventures. Every playthrough is a unique experience."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
      {icon}
      <h3 className="text-white text-2xl font-poppins font-semibold">
        {title}
      </h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="p-6 flex items-center gap-4 justify-between">
      <p>Aygon</p>
      <p>2025&copy; Aygon.</p>
    </footer>
  );
}
