import { cnm } from "@/utils/style";
import { motion } from "framer-motion";
import { Heart, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PlayBattlePage() {
  const [isLoadingRoom, setLoadingRoom] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingRoom(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [currentState, setCurrentState] = useState(battleData[0]);
  // const [latestAction, setLatestAction] = useState(null);
  // const [battleHistory, setBattleHistory] = useState([]);
  // const processedTimestampsRef = useRef(new Set());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (currentIndex < battleData.length - 1) {
  //       setCurrentIndex((prev) => prev + 1);
  //     }
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, [currentIndex, battleData.length]);

  // useEffect(() => {
  //   const newState = battleData[currentIndex];
  //   setCurrentState(newState);

  //   // Process new commentary entries
  //   if (newState.commentary) {
  //     const newCommentaries = newState.commentary.filter((comment) => {
  //       if (!processedTimestampsRef.current.has(comment.timestamp)) {
  //         processedTimestampsRef.current.add(comment.timestamp);
  //         return true;
  //       }
  //       return false;
  //     });

  //     if (newCommentaries.length > 0) {
  //       setBattleHistory((prev) => [
  //         ...prev,
  //         ...newCommentaries.map((comment) => comment.text),
  //       ]);

  //       // Set latest action for animation
  //       const latestCommentary = newCommentaries[newCommentaries.length - 1];
  //       const correspondingAction = newState.actions.find(
  //         (action) => action.timestamp === latestCommentary.timestamp
  //       );

  //       if (correspondingAction) {
  //         setLatestAction({
  //           ...correspondingAction,
  //           timestamp: Date.now(), // Force new key for animation
  //         });

  //         const timeout = setTimeout(() => {
  //           setLatestAction(null);
  //         }, 3000);

  //         return () => clearTimeout(timeout);
  //       }
  //     }
  //   }
  // }, [currentIndex, battleData]);

  // if (!currentState) return null;

  // const { heroes, currentTurn, lastUpdate } = currentState;
  // const hero1 = heroes.hero1;
  // const hero2 = heroes.hero2;

  return (
    <div className="w-full h-screen flex flex-col items-center px-5 overflow-hidden">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="h-20 w-full flex items-center justify-between px-3">
          <p className="font-semibold">Room 1</p>
          <div className="size-8 bg-blue-400 rounded-full"></div>
        </div>
        <motion.div
          initial={{
            y: "100%",
          }}
          animate={{
            y: isLoadingRoom ? "100%" : "0%",
          }}
          transition={{
            duration: 0.5,
            ease: [0.25, 1, 0.5, 1],
          }}
          className="w-full h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden bg-neutral-900 border border-white/10 rounded-t-3xl p-5"
        >
          <div className="w-full flex items-center justify-center gap-4 relative">
            {/* card 1 */}
            <PlayerCard />
            <PlayerCard />

            {/* card 2 */}
          </div>

          <div className="w-full flex flex-col mt-12">
            {/* <ActivityCard activity={battleHistory.join("\n\n")} /> */}
          </div>
        </motion.div>
      </div>
    </div>
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
    <div className="bg-neutral-800 rounded-2xl min-h-[600px]">
      <div className="p-5">
        <p className="text-xl font-medium">Activity</p>
      </div>
      <div className="bg-black p-4">
        <div className="h-64 overflow-y-auto pr-2 space-y-2">
          {messages.map((message, index) => {
            const [action, description, result] = message.split("\n");

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col space-y-1"
              >
                {/* Action header */}
                <div className="text-xs text-gray-400 px-2">
                  {action?.replace("undefined ", "")}
                </div>

                {/* Main message bubble */}
                <div className="bg-gray-700 rounded-lg px-4 py-2 text-gray-200 text-sm inline-block max-w-[90%]">
                  <div>{description}</div>
                  <div className="text-yellow-400 font-semibold mt-1">
                    {result}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

function PlayerCard({
  name = "Kucing Oyen",
  desc = "A photon manipulator who bends light to blind, shield, and strike with radiant precision.",
  hpPercent = 50,
  specialPercent = 50,
}) {
  return (
    <div className="w-full min-h-64 bg-neutral-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      <div className="w-full relative overflow-hidden h-44">
        <img src="/assets/jinx.jpg" alt="" className="object-cover size-full" />
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
