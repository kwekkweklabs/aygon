import React from "react";
import { Swords, Users, Clock } from "lucide-react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router";
import { cnm } from "@/utils/style";

export default function RoomCard({
  roomId = null,
  name = "Room 1",
  hero1 = null,
  hero2 = null,
  state = "WAITING",
}) {
  const statusConfig = {
    WAITING: {
      icon: <Clock size={14} className="text-yellow-400" />,
      text: "Waiting",
      bgColor: "bg-yellow-400/10",
      textColor: "text-yellow-400",
    },
    PLAYING: {
      icon: <Swords size={14} className="text-green-400" />,
      text: "In Battle",
      bgColor: "bg-green-400/10",
      textColor: "text-green-400",
    },
    FINISHED: {
      icon: <Users size={14} className="text-blue-400" />,
      text: "Finished",
      bgColor: "bg-blue-400/10",
      textColor: "text-blue-400",
    },
  };

  const status = statusConfig[state] || statusConfig.WAITING;
  const navigate = useNavigate();

  return (
    <div className="w-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-lg hover:border-purple-500/50 transition-all duration-300">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800">
        <h3 className="font-bold text-neutral-200">{name}</h3>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor} ${status.textColor} text-xs font-medium`}
        >
          {status.icon}
          {status.text}
        </div>
      </div>

      {/* Battle Arena Section */}
      <div className="p-4">
        {hero1 || hero2 ? (
          <div className="relative h-48 flex items-center justify-center">
            {/* Hero 1 Card */}
            <div className="absolute top-1/2 -translate-y-1/2 -rotate-12 transform transition-transform duration-300 hover:scale-105 hover:-rotate-6 z-10 left-[4rem]">
              <div className="w-40 bg-neutral-800 rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg">
                <div className="aspect-square">
                  <img
                    src={hero1?.image || "/placeholder.svg"}
                    alt={hero1?.name || "Empty slot"}
                    className={cnm("w-full h-full object-cover", !hero1?.image && "opacity-0")}
                  />
                </div>
                <div className="p-2 bg-neutral-900/90">
                  <p className="text-sm font-bold text-neutral-200 truncate">
                    {hero1?.name || "Waiting..."}
                  </p>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="relative z-20 transform transition-transform duration-300 hover:scale-110 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-500 border-4 border-neutral-800 shadow-lg flex items-center justify-center">
                <Swords size={24} className="text-white" />
              </div>
              <div className="absolute size-16 rounded-full border-4 border-purple-400/30 animate-ping" />
            </div>

            {/* Hero 2 Card */}
            <div className="absolute top-1/2 -translate-y-1/2 rotate-12 transform transition-transform duration-300 hover:scale-105 hover:rotate-6 z-10 right-[4rem]">
              <div className="w-40 bg-neutral-800 rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg">
                <div className="aspect-square">
                  <img
                    src={hero2?.image || "/placeholder.svg"}
                    alt={hero2?.name || "Empty slot"}
                    className={cnm("w-full h-full object-cover", !hero2?.image && "opacity-0")}
                  />
                </div>
                <div className="p-2 bg-neutral-900/90">
                  <p className="text-sm font-bold text-neutral-200 truncate">
                    {hero2?.name || "Waiting..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-neutral-400">
            <p className="text-sm">Empty Room - Be the First to Join!</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-4 pt-0 mt-4">
        <Button
          size="lg"
          className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          onPress={() => {
            navigate(`/room/${roomId}`);
          }}
        >
          <Users size={16} />
          Join Battle (0.01 ETH Bet)
        </Button>
      </div>
    </div>
  );
}
