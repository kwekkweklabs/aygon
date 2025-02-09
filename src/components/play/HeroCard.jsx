import React from "react";
import { Trophy, Skull } from "lucide-react";

export default function HeroCard({
  name = "Lyra Shadowbane",
  imageUrl = "/placeholder.svg?height=300&width=200",
  desc = "A description",
  winCount = 0,
  loseCount = 0,
}) {
  const totalGames = winCount + loseCount;
  const winRate =
    totalGames > 0 ? Math.round((winCount / totalGames) * 100) : 0;

  return (
    <div className="w-full bg-neutral-900 rounded-xl overflow-hidden shadow-lg border border-neutral-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-purple-500">
      {/* Image Section with Overlaid Name */}
      <div className="relative aspect-square">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900/60" />
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover rounded-b-2xl"
        />
        {/* Pill-style name overlay */}
        <div className="absolute top-3 left-0 right-0 flex justify-center">
          <div className="bg-neutral-900/90 px-3 py-1 rounded-full border border-neutral-700/50">
            <h2 className="text-base font-semibold text-white truncate max-w-[200px]">
              {name}
            </h2>
          </div>
        </div>
      </div>

      {/* Description - Fixed Height */}
      <div className="px-3 py-2 h-14 mt-2">
        <p className="text-xs text-neutral-300 line-clamp-3 text-center">
          {desc}
        </p>
      </div>

      {/* Stats Section */}
      <div className="p-2 bg-neutral-800/50 mt-2">
        <div className="flex justify-between items-center rounded-lg bg-neutral-800 p-2">
          {/* Win Stats */}
          <div className="flex items-center gap-1">
            <div className="bg-green-900/50 p-1 rounded">
              <Trophy size={14} className="text-green-400" />
            </div>
            <span className="text-green-400 font-bold text-xs">{winCount}</span>
          </div>

          {/* Win Rate */}
          <div className="text-center px-1">
            <div className="text-xs font-bold text-purple-400">{winRate}%</div>
          </div>

          {/* Lose Stats */}
          <div className="flex items-center gap-1">
            <span className="text-red-400 font-bold text-xs">{loseCount}</span>
            <div className="bg-red-900/50 p-1 rounded">
              <Skull size={14} className="text-red-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
