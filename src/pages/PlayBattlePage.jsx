import StarfieldEffect from "@/components/elements/StarfieldEffect";
import { useAygonQuery } from "@/lib/aygon-sdk/query";
import { cnm } from "@/utils/style";
import { Spinner } from "@heroui/react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Heart, Swords, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function PlayBattlePage() {
  const {
    data: roomStates,
    isLoading: isRoomStatesLoading,
    refetch: refetchRoomStates,
  } = useAygonQuery({
    queryKey: ["room-states"],
    queryFn: async ({ sdk, context }) => {
      const res = await sdk.getRoomStates({
        signal: context.signal,
        roomId: "battle-room-1-UH4Rr",
      });
      return res;
    },
  });

  const [battleHistory, setBattleHistory] = useState([]);
  const [latestAction, setLatestAction] = useState(null);
  const [isBattleFinished, setIsBattleFinished] = useState(false);
  const [processedTurns, setProcessedTurns] = useState(new Set());

  const states = useMemo(() => roomStates?.states || [], [roomStates]);

  // Handle state updates and refetching using recursive setTimeout
  useEffect(() => {
    if (isRoomStatesLoading || isBattleFinished) return;

    let timeoutId;

    const updateState = async () => {
      try {
        await refetchRoomStates();
        timeoutId = setTimeout(updateState, 2000);
      } catch (error) {
        console.error("Failed to fetch room states:", error);
        timeoutId = setTimeout(updateState, 2000);
      }
    };

    timeoutId = setTimeout(updateState, 2000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isRoomStatesLoading, isBattleFinished, refetchRoomStates]);

  // Process new turns
  useEffect(() => {
    if (states.length === 0) return;

    // Process all unprocessed turns in order
    states.forEach((state) => {
      if (!processedTurns.has(state.turnIndex)) {
        if (state.isFinished) {
          setIsBattleFinished(true);
        }

        if (state.commentary) {
          setBattleHistory((prev) => [...prev, state.commentary]);

          if (state.action) {
            setLatestAction({
              ...state.action,
              timestamp: Date.now(),
            });

            // Clear action after animation
            const timeout = setTimeout(() => {
              setLatestAction(null);
            }, 3000);

            return () => clearTimeout(timeout);
          }
        }

        // Mark turn as processed
        setProcessedTurns((prev) => new Set([...prev, state.turnIndex]));
      }
    });
  }, [states]);

  const hero1 = roomStates?.hero1;
  const hero2 = roomStates?.hero2;

  // Get current state based on the highest processed turn
  const currentState = useMemo(() => {
    if (states.length === 0) return null;
    const maxProcessedTurn = Math.max(...Array.from(processedTurns));
    return (
      states.find((state) => state.turnIndex === maxProcessedTurn) || states[0]
    );
  }, [states, processedTurns]);

  return (
    <div className="w-full h-screen flex flex-col items-center px-5 overflow-hidden pt-12">
      <div className="w-full h-screen fixed z-[0]">
        <Canvas>
          <StarfieldEffect />
        </Canvas>
      </div>

      {isRoomStatesLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Spinner />
          <p className="animate-pulse text-neutral-400">
            Loading battle states...
          </p>
        </div>
      ) : (
        <>
          {!roomStates ? (
            <div className="min-h-screen flex flex-col items-center justify-center">
              <p>Room states is not available</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col items-center  relative">
              <div className="h-20 w-full flex items-center justify-between px-3">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full">
                  <p className="font-semibold">Room 1</p>
                </div>
                <div className="size-8 bg-blue-400 rounded-full"></div>
              </div>
              <div className="w-full h-[calc(100vh-128px)] overflow-y-auto overflow-x-hidden bg-neutral-900 border border-white/10 rounded-t-3xl p-5">
                <div className="w-full flex items-center justify-center gap-4 relative">
                  {/* card 1 */}
                  <div className="w-full -rotate-6">
                    <PlayerCard
                      className={"hover:rotate-6 "}
                      name={hero1.name}
                      desc={hero2.description}
                      image={hero1.image}
                    />
                  </div>
                  {/* VS Badge */}
                  <div className="relative z-20 transform transition-transform duration-300 hover:scale-110 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500 border-4 border-neutral-800 shadow-lg flex items-center justify-center">
                      <Swords size={24} className="text-white" />
                    </div>
                    <div className="absolute size-16 rounded-full border-4 border-purple-400/30 animate-ping" />
                  </div>

                  <div className="w-full rotate-6">
                    <PlayerCard
                      className="hover:-rotate-6 "
                      name={hero2.name}
                      desc={hero2.description}
                      image={hero2.image}
                    />
                  </div>

                  {/* card 2 */}
                </div>

                <div className="w-full flex flex-col mt-5">
                  <ActivityCard activity={battleHistory.join("\n\n")} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActivityMessage({ message, index }) {
  const [action, description, result] = message.split("\n");
  const cleanAction = action?.replace("undefined ", "").trim();

  // If it's a commentary-only message (i.e., battle start), render without action header
  const isCommentaryOnly = !cleanAction?.includes(":");

  if (isCommentaryOnly) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1,
        }}
        className="flex flex-col"
      >
        <div className="text-gray-200 text-sm leading-relaxed">{message}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
      }}
      className="flex flex-col space-y-1.5"
    >
      <div className="text-xs text-gray-400 px-2">{cleanAction}</div>
      <div
        className="bg-gray-700/70 rounded-lg px-4 py-2.5 text-gray-200 text-sm 
        inline-block max-w-[90%] shadow-lg backdrop-blur-sm"
      >
        {description && <div className="leading-relaxed">{description}</div>}
        {result && (
          <div className="text-yellow-400 font-medium mt-1.5 leading-relaxed">
            {result}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActivityCard({ activity }) {
  const messagesEndRef = useRef(null);
  const messages = activity.split("\n\n").filter(Boolean);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activity]);

  return (
    <div className="bg-neutral-800 rounded-2xl h-[600px] flex flex-col">
      <div className="p-5 border-b border-white/5">
        <p className="text-xl font-medium">Activity</p>
      </div>
      <div className="bg-black/50 rounded-b-2xl p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="h-full pr-2 space-y-3">
          {messages.map((message, index) => (
            <ActivityMessage key={index} message={message} index={index} />
          ))}
          <div ref={messagesEndRef} className="h-px" />
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  name = "Kucing Oyen",
  desc = "A photon manipulator who bends light to blind, shield, and strike with radiant precision.",
  image = "/assets/jinx.jpg",
  hpPercent = 50,
  specialPercent = 50,
  className,
}) {
  return (
    <div
      className={cnm(
        "w-full min-h-64 bg-neutral-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden scale-75",
        "transform transition-all duration-300 hover:scale-85 hover:shadow-xl hover:border-purple-500",
        className
      )}
    >
      <div className="w-full relative overflow-hidden h-44">
        <img src={image} alt="" className="object-cover size-full" />
      </div>
      <div className="p-6">
        <p className="font-semibold text-xl tracking-tight">{name}</p>
        <p className="text-neutral-400 mt-3 text-sm">{desc}</p>

        <div className="w-full flex mt-5 flex-col">
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-1 text-green-400 px-2 py-1 rounded-md bg-green-500/10">
                <Heart className="w-3 h-3 text-green-400" />
                <p>HP</p>
              </div>
              <p>{hpPercent}%</p>
            </div>
            <ProgressBar
              percent={hpPercent}
              className="bg-gradient-to-r from-green-200 to-green-400"
            />
          </div>
          <div className="w-full flex flex-col gap-2 mt-4">
            <div className="w-full flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-1 text-primary-400 px-2 py-1 rounded-md bg-primary-500/10">
                <Zap className="w-3 h-3 text-primary-400" />
                <p>Special</p>
              </div>
              <p>{specialPercent}%</p>
            </div>
            <ProgressBar
              percent={specialPercent}
              className="bg-gradient-to-r from-primary-200 to-primary-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ percent, className = "" }) {
  return (
    <div className="w-full h-5 rounded-full overflow-hidden relative border border-white/10 bg-neutral-900">
      <motion.div
        initial={{
          scaleX: 0,
        }}
        animate={{
          scaleX: percent / 100,
        }}
        style={{
          originX: 0,
        }}
        className={cnm(
          "w-full h-full absolute bg-primary rounded-full",
          className
        )}
      ></motion.div>
    </div>
  );
}
