export default function HeroCard({
  name = "Lyra Shadowbane",
  imageUrl = "/placeholder.svg?height=300&width=200",
  desc = "A description",
}) {
  return (
    <div className="w-full min-w-[260px] bg-neutral-900 rounded-3xl overflow-hidden shadow-lg border border-neutral-700">
      <div className="relative h-40">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-lg font-bold text-white truncate">{name}</h2>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p>{desc}</p>
      </div>
    </div>
  );
}
