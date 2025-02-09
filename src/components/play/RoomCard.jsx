import { Button } from "@heroui/react";

export default function RoomCard({ name, hero1, hero2, state }) {
  return (
    <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <p className="text-xl font-semibold">{name}</p>

        <RoomStatusPill status={state} />
      </div>

      {!hero1 || !hero2 ? null : (
        <div>
          <p>
            {hero1.name} vs {hero2.name}
          </p>
        </div>
      )}

      <Button
        variant="solid"
        color="primary"
        className="w-full mt-auto bg-blue-500"
      >
        Join Room
      </Button>
    </div>
  );
}

function RoomStatusPill({ status }) {
  status = status.toLowerCase();
  switch (status) {
    case "waiting":
      return (
        <div className="px-3 py-1 rounded-full bg-warning-50 text-warning">
          Waiting
        </div>
      );
    default:
      return <div>{status}</div>;
  }
}
