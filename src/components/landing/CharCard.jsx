import { Shield, Sword, Heart, Zap, Star } from "lucide-react";

export default function CharCard({
  name = "Lyra Shadowbane",
  level = 35,
  class: heroClass = "Shadow Assassin",
  imageUrl = "/placeholder.svg?height=300&width=200",
  stats = {
    attack: 85,
    defense: 60,
    health: 110,
    energy: 90,
  },
}) {
  const statsList = [
    {
      name: "ATK",
      value: stats.attack,
      icon: <Sword className="w-3 h-3" />,
      color: "text-red-400",
    },
    {
      name: "DEF",
      value: stats.defense,
      icon: <Shield className="w-3 h-3" />,
      color: "text-blue-400",
    },
    {
      name: "HP",
      value: stats.health,
      icon: <Heart className="w-3 h-3" />,
      color: "text-green-400",
    },
    {
      name: "MP",
      value: stats.energy,
      icon: <Zap className="w-3 h-3" />,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="w-full min-w-[260px] max-w-xs bg-gray-900 rounded-3xl overflow-hidden shadow-lg border border-gray-700">
      <div className="relative h-40">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h2 className="text-lg font-bold text-white truncate">{name}</h2>
          <p className="text-xs text-gray-300">{heroClass}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm font-semibold">
            Level {level}
          </span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(level / 10)
                    ? "text-yellow-400"
                    : "text-gray-600"
                }`}
                fill="currentColor"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {statsList.map((stat) => (
            <div
              key={stat.name}
              className="bg-gray-800 rounded-lg p-2 flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className={`mr-1 ${stat.color}`}>{stat.icon}</span>
                <span className="text-gray-300 text-xs font-medium">
                  {stat.name}
                </span>
              </div>
              <span className="text-gray-100 text-xs font-bold">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
