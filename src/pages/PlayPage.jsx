import StarfieldEffect from "@/components/elements/StarfieldEffect";
import CreateHeroButton from "@/components/play/CreateHeroButton";
import HeroCard from "@/components/play/HeroCard";
import RoomCard from "@/components/play/RoomCard";
import { useAygonQuery } from "@/lib/aygon-sdk/query";
import { Button, Skeleton } from "@heroui/react";
import { Canvas } from "@react-three/fiber";

export default function PlayPage() {
  const {
    data: heroList,
    isLoading: isHeroListLoading,
    refetch: refetchHero,
  } = useAygonQuery({
    queryKey: ["hero-list"],
    queryFn: async ({ sdk, context }) => {
      const res = await sdk.getUserHeroes({ signal: context.signal });
      console.log("Hero List", res);
      return res;
    },
  });

  const { data: roomList, isLoading: isRoomListLoading } = useAygonQuery({
    queryKey: ["room-list"],
    queryFn: async ({ sdk, context }) => {
      const res = await sdk.getRoomList({ signal: context.signal });
      return res;
    },
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-20 px-5">
      <div className="w-full h-screen fixed z-[0]">
        <Canvas>
          <StarfieldEffect />
        </Canvas>
      </div>

      <div className="w-full max-w-[80rem] flex flex-col items-center z-20 relative">
        {/* Heroes */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between">
            <p className="font-poppins font-semibold text-2xl">My Heroes</p>

            <CreateHeroButton refetchHero={refetchHero} />
          </div>

          <Skeleton
            isLoaded={!isHeroListLoading}
            className="dark rounded-2xl min-h-[300px]"
          >
            {heroList ? (
              <div className="w-full grid-cols-4 grid gap-4">
                {heroList.map((hero) => (
                  <HeroCard
                    desc={hero.description}
                    name={hero.name}
                    imageUrl={hero.image}
                    key={hero.id}
                    winCount={hero.winBattleCount}
                    loseCount={hero.loseBattleCount}
                  />
                ))}
              </div>
            ) : (
              <div>Hero Not Available</div>
            )}
          </Skeleton>
        </div>

        {/* Rooms */}
        <div className="w-full flex flex-col gap-6 mt-16">
          <p className="font-poppins font-semibold text-2xl">Rooms</p>
          <Skeleton
            isLoaded={!isRoomListLoading}
            className="dark rounded-2xl min-h-[300px]"
          >
            {roomList ? (
              <div className="w-full grid-cols-2 grid gap-4">
                {roomList.map((room) => (
                  <RoomCard
                    key={room.id}
                    hero1={room.hero1}
                    hero2={room.hero2}
                    name={room.name}
                    state={room.state}
                    roomId={room.id}
                  />
                ))}
              </div>
            ) : (
              <div>Room Not Available</div>
            )}
          </Skeleton>
        </div>
      </div>
    </div>
  );
}
