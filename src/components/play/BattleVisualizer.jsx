import StarfieldEffect from "@/components/elements/StarfieldEffect";
import { useAygonQuery } from "@/lib/aygon-sdk/query";
import { cnm } from "@/utils/style";
import { Spinner } from "@heroui/react";
import { Canvas } from "@react-three/fiber";
import dayjs from "dayjs";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Heart, Swords, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const StyledVersusCard = ({
  hero1Name,
  hero2Name,
  winnerHeroId,
  hero1Id,
  hero2Id,
}) => (
  <div
    className={cnm(
      "bg-neutral-800 p-5 rounded-2xl flex-1 relative overflow-hidden group flex items-center border border-white/10",
      winnerHeroId && "border-yellow-500"
    )}
  >
    {winnerHeroId ? (
      <>
        <div className="absolute size-full inset-0 bg-yellow-500/10"></div>
        <div className="text-yellow-500 font-semibold text-2xl w-full flex items-center justify-center">
          The Winner Is {winnerHeroId === hero1Id ? hero1Name : hero2Name}
        </div>
      </>
    ) : (
      <div className="relative  w-full flex justify-center items-center">
        <div className="flex items-center gap-5">
          <span className="font-semibold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent text-center">
            {hero1Name}
          </span>
          <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
            VS
          </span>
          <span className="font-semibold bg-gradient-to-r from-blue-400 to-primary-400 bg-clip-text text-transparent text-center">
            {hero2Name}
          </span>
        </div>
      </div>
    )}
  </div>
);

export default function BattleVisualizer({ currentRoomId }) {
  const {
    data: roomStates,
    isLoading: isRoomStatesLoading,
    refetch: refetchRoomStates,
  } = useAygonQuery({
    queryKey: ["room-states"],
    queryFn: async ({ sdk, context }) => {
      const res = await sdk.getRoomStates({
        signal: context.signal,
        roomId: currentRoomId,
      });
      return res;
    },
  });

  const [battleHistory, setBattleHistory] = useState([]);
  const [latestAction, setLatestAction] = useState(null);
  const [isBattleFinished, setIsBattleFinished] = useState(false);
  const processedTurnsRef = useRef(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [currentTurn, setCurrentTurn] = useState(0);
  const [hero1Stats, setHero1Stats] = useState({
    hp: 100,
    special: 100,
    effects: [],
  });
  const [hero2Stats, setHero2Stats] = useState({
    hp: 100,
    special: 100,
    effects: [],
  });

  const states = useMemo(() => roomStates?.states || [], [roomStates]);
  const hero1 = roomStates?.hero1;
  const hero2 = roomStates?.hero2;
  const battleStatus = roomStates?.battle;

  console.log({ battleHistory });

  console.log({ roomStates });

  console.log({ processedTurns: processedTurnsRef.current });

  function play(soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  }

  // Handle state updates and refetching
  useEffect(() => {
    if (isRoomStatesLoading || isBattleFinished) return;

    let timeoutId;
    let isActive = true;

    const updateState = async () => {
      if (!isActive || isBattleFinished) return;

      try {
        await refetchRoomStates();
        setLastUpdateTime(Date.now());

        if (isActive && !isBattleFinished) {
          timeoutId = setTimeout(updateState, 2000);
        }
      } catch (error) {
        console.error("Failed to fetch room states:", error);
        if (isActive && !isBattleFinished) {
          timeoutId = setTimeout(updateState, 2000);
        }
      }
    };

    timeoutId = setTimeout(updateState, 2000);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isRoomStatesLoading, isBattleFinished, refetchRoomStates]);

  useEffect(() => {
    let timeout;
    if (states.length === 0) return;
    if (battleStatus.status === "FINISHED") {
      setCurrentTurn(states.length - 1);
      setIsBattleFinished(true);
      // setBattleHistory(states.map((state) => state.commentary));
      return;
    }

    states.forEach((state) => {
      const turnIndex = state.turnIndex;
      const stateId = state.id;
      if (turnIndex === undefined) return;

      if (processedTurnsRef.current.has(stateId)) return;

      if (state.isFinished) {
        setIsBattleFinished(true);
        setBattleHistory([]);
        processedTurnsRef.current = new Set();
      }

      if (state.hero1State) {
        setHero1Stats({
          hp: state.hero1State.hp,
          special: state.hero1State.specialMeter,
          effects: state.hero1State.effects,
        });
      }

      if (state.hero2State) {
        setHero2Stats({
          hp: state.hero2State.hp,
          special: state.hero2State.specialMeter,
          effects: state.hero2State.effects,
        });
      }

      if (state.turnIndex) {
        setCurrentTurn(state.turnIndex + 1);
      }

      if (state.commentary) {
        setBattleHistory((prev) => [...prev, state.commentary]);

        if (state.action) {
          if (state.action.soundEffects) {
            state.action.soundEffects.forEach((soundPath) => {
              const sound = new Howl({
                src: [`/assets/audio/${soundPath}`],
              });
              sound.play();
            });
          }
          setLatestAction({
            ...state.action,
            timestamp: Date.now(),
          });

          timeout = setTimeout(() => {
            setLatestAction(null);
          }, 3000);
        }
      }

      processedTurnsRef.current.add(stateId);
    });

    return () => {
      clearTimeout(timeout);
    };
  }, [states, battleStatus]);

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
          <p className="animate-pulse text-neutral-400 mt-4">
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
                  <p className="font-semibold">{currentRoomId}</p>
                </div>
              </div>
              <div className="w-full h-[calc(100vh-128px)] overflow-y-auto overflow-x-hidden bg-neutral-900 border border-white/10 rounded-t-3xl p-5">
                <div className="w-full flex items-center justify-center gap-4 relative">
                  {/* card 1 */}
                  <div className="w-full relative">
                    <div className="w-full relative -rotate-6">
                      <PlayerCard
                        type="hero1"
                        className={"hover:rotate-6 "}
                        name={hero1.name}
                        desc={hero2.description}
                        image={hero1.image}
                        hpPercent={hero1Stats.hp}
                        specialPercent={hero1Stats.special}
                        isWin={battleStatus.winnerHeroId === hero1.id}
                        latestAction={latestAction}
                      />
                    </div>
                    <div className="scale-[0.6] absolute top-[20%] left-6 z-20">
                      <AnimatePresence mode="wait">
                        {latestAction && latestAction.actor === "hero1" && (
                          <ActionAnimation
                            action={latestAction}
                            position="left"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {/* VS Badge */}
                  <div className="relative z-20 transform transition-transform duration-300 hover:scale-110 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500 border-4 border-neutral-800 shadow-lg flex items-center justify-center">
                      <Swords size={24} className="text-white" />
                    </div>
                    <div className="absolute size-16 rounded-full border-4 border-purple-400/30 animate-ping" />
                  </div>

                  <div className="w-full relative">
                    <div className="w-full relative rotate-6">
                      <PlayerCard
                        type="hero2"
                        className="hover:-rotate-6 "
                        name={hero2.name}
                        desc={hero2.description}
                        image={hero2.image}
                        hpPercent={hero2Stats.hp}
                        specialPercent={hero2Stats.special}
                        isWin={battleStatus.winnerHeroId === hero2.id}
                        latestAction={latestAction}
                      />
                    </div>
                  </div>

                  {/* card 2 */}

                  <div className="scale-[0.6] absolute bottom-[20%] right-6 z-20">
                    <AnimatePresence mode="wait">
                      {latestAction && latestAction.actor === "hero2" && (
                        <ActionAnimation
                          action={latestAction}
                          position="right"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="w-full mt-5 flex gap-4">
                  {/* VERSUS CARD */}
                  <StyledVersusCard
                    hero1Name={hero1.name}
                    hero2Name={hero2.name}
                    hero1Id={hero1.id}
                    hero2Id={hero2.id}
                    winnerHeroId={battleStatus.winnerHeroId}
                  />
                  {/* NEIGHBOR CARD */}
                  <div className="bg-neutral-800 border border-white/10 p-5 rounded-2xl flex-1 flex items-start flex-col justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <p className="text-neutral-400">Battle Status </p>
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium">
                        {battleStatus.status}
                      </div>
                    </div>
                    <p className="text-neutral-400">
                      Current Turn{" "}
                      <span className="text-primary font-medium px-3 py-1 rounded-full bg-primary/10">
                        {currentTurn}
                      </span>
                    </p>
                    <p className="text-neutral-400">
                      Last Update:{" "}
                      <span className="text-white font-medium">
                        {dayjs(lastUpdateTime).format("HH:mm:ss, DD-MM-YYYY")}
                      </span>
                    </p>
                  </div>
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

  const isCommentaryOnly = !cleanAction?.includes(":");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
      }}
      className="flex flex-col space-y-1.5"
    >
      {isCommentaryOnly ? (
        <div className="text-gray-200 text-sm leading-relaxed py-2">
          {message}
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 px-2">{cleanAction}</div>
          <div
            className="bg-gray-700/70 rounded-lg px-4 py-2.5 text-gray-200 text-sm 
        inline-block max-w-[90%] shadow-lg backdrop-blur-sm"
          >
            {description && (
              <div className="leading-relaxed">{description}</div>
            )}
            {result && (
              <div className="text-yellow-400 font-medium mt-1.5 leading-relaxed">
                {result}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function ActivityCard({ activity }) {
  const scrollContainerRef = useRef(null);
  const messages = activity.split("\n\n").filter(Boolean);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activity]);

  return (
    <div className="bg-neutral-800 rounded-2xl flex flex-col">
      <div className="p-5 border-b border-white/5">
        <p className="text-xl font-medium">Activity</p>
      </div>
      <div
        ref={scrollContainerRef}
        className="bg-black/50 rounded-b-2xl h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        <div className="space-y-3 p-4">
          {messages.map((message, index) => (
            <ActivityMessage key={index} message={message} index={index} />
          ))}
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
  isWin = false,
  type = "hero1",
  latestAction,
}) {
  return (
    <div
      className={cnm(
        "w-full min-h-64 bg-neutral-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden scale-75 relative",
        "transform transition-all duration-300 hover:scale-85 hover:shadow-xl hover:border-purple-500",
        isWin
          ? [
              "border-yellow-500 border scale-90",
              type === "hero2" ? "-rotate-6" : "rotate-6",
            ]
          : "",
        type === "hero1" ? "border-red-400" : "border-blue-400",
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
      {isWin && (
        <div className="h-10 flex items-center px-4 text-sm bg-yellow-500 rounded-xl text-black font-medium absolute top-5 left-5">
          WINNER
        </div>
      )}
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

const ActionAnimation = ({ action, className, position = "left" }) => {
  if (!action) return null;

  return (
    <motion.div
      key={action.timestamp}
      initial={{
        scale: 0.5,
        opacity: 0,
        x: position === "left" ? -50 : 50,
      }}
      animate={{
        scale: 1,
        opacity: 1,
        x: 0,
      }}
      exit={{
        scale: 0.8,
        opacity: 0,
        y: 50,
        transition: { duration: 0.5 },
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className={cnm(`flex flex-col items-center gap-3 w-full z-50`)}
    >
      <div className="flex gap-2 mb-2">
        {action.emojis.map((emoji, index) => (
          <motion.span
            key={index}
            className="text-5xl scale-150"
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 0.8,
              delay: index * 0.2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="text-center text-white font-bold bg-gray-800/90 px-6 py-3 rounded-xl text-lg shadow-lg backdrop-blur-sm border border-gray-700 whitespace-nowrap"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      >
        {action.description}
      </motion.div>
    </motion.div>
  );
};
