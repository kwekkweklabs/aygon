import StarfieldEffect from '@/components/elements/StarfieldEffect'
import { useAuth } from '@/providers/AuthProvider'
import { useRoom } from '@/providers/RoomProvider'
import { useGameSound } from '@/providers/SoundEngineProvider'
import { cnm } from '@/utils/style'
import { Button, Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@heroui/react'
import { Canvas } from '@react-three/fiber'
import { SkullIcon, SwordIcon, TrophyIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'

export default function RoomPage() {
  const { currentRoom } = useRoom()
  const { playSound, playBgMusic, stopBgMusic } = useGameSound()
  return (
    <div className="w-full h-screen flex flex-col items-center px-5 overflow-hidden pt-12">
      <div className="w-full h-screen fixed z-[0]">
        <Canvas>
          <StarfieldEffect />
        </Canvas>
      </div>

      <div className='pt-[8rem] z-20 relative w-full container max-w-3xl mx-auto'>
        <h1 className='text-center text-3xl font-bold'>
          {currentRoom?.name}
        </h1>
        <Button
          onPress={() => {
            playSound(['quack.mp3', 'nya-cute-girl.mp3', 'bomb-explode.mp3'])
          }}
        >
          Test Sound
        </Button>
        <Button
          onPress={() => {
            playBgMusic()
          }}
        >
          Play BG
        </Button>
        <Button
          onPress={() => {
            stopBgMusic()
          }}
        >
          Stop BG
        </Button>
        {/* <div className='mt-8'>
          <RoomStateVisualizer />
        </div> */}

        {!currentRoom &&
          <div className='flex flex-col items-center justify-center py-[10rem]'>
            <Spinner size='lg' color='primary' />
          </div>
        }

        {currentRoom?.state === "WAITING" && <IdleRoom />}

        {currentRoom?.state === "PLAYING" &&
          <div>
            CURRENT BATTLE ID = {currentRoom?.currentBattleId}
          </div>
        }

        <Button>LEAVE</Button>
      </div>
    </div>
  )
}

const IdleRoom = () => {
  const { me } = useAuth();
  const { currentRoom, joinRoom, myHero, loading, leaveRoom } = useRoom();
  const [isOpenHeroPickDialog, setIsOpenHeroPickDialog] = useState(false);
  const [selectedHero, setSelectedHero] = useState();
  const navigate = useNavigate();

  const isUserJoined = currentRoom?.hero1?.user?.id === me?.id || currentRoom?.hero2?.user?.id === me?.id;

  const handleJoinRoom = async () => {
    await joinRoom(currentRoom?.id, selectedHero?.id);
    setIsOpenHeroPickDialog(false);
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    navigate('/play');
  };

  const HeroSlot = ({ hero, isPlayer2 = false }) => (
    <div className="w-64 bg-neutral-900 rounded-xl overflow-hidden shadow-lg border border-neutral-700 transform transition-all duration-300 hover:scale-105 hover:border-purple-500">
      <div className="relative aspect-square">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900/60" />
        {hero ? (
          <img
            src={hero.image}
            alt={hero.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
            <div className="text-neutral-500 text-lg font-semibold">Empty Slot</div>
          </div>
        )}
        <div className="absolute top-3 left-0 right-0 flex justify-center">
          <div className="bg-neutral-900/90 px-3 py-1 rounded-full border border-neutral-700/50">
            <h2 className="text-base font-semibold text-white truncate max-w-[200px]">
              {hero ? hero.name : 'Waiting for Player'}
            </h2>
          </div>
        </div>
      </div>

      {hero && (
        <div className="p-2 bg-neutral-800/50">
          <div className="flex justify-between items-center rounded-lg bg-neutral-800 p-2">
            <div className="flex items-center gap-1">
              <div className="bg-green-900/50 p-1 rounded">
                <TrophyIcon size={14} className="text-green-400" />
              </div>
              <span className="text-green-400 font-bold text-xs">12</span>
            </div>
            <div className="text-center px-1">
              <div className="text-xs font-bold text-purple-400">67%</div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-bold text-xs">6</span>
              <div className="bg-red-900/50 p-1 rounded">
                <SkullIcon size={14} className="text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 p-8 z-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center gap-8">
            <HeroSlot hero={currentRoom?.hero1} />

            <div className="flex flex-col items-center gap-4">
              <div className="bg-purple-900/30 p-4 rounded-full">
                <SwordIcon size={32} className="text-purple-400" />
              </div>
              <div className="text-purple-400 font-bold text-xl">VS</div>
            </div>

            <HeroSlot hero={currentRoom?.hero2} isPlayer2 />
          </div>

          <div className="flex flex-col gap-4 items-center">
            {isUserJoined ? (
              <Button
                onPress={handleLeaveRoom}
                className="bg-red-500 text-white font-bold px-8 py-6 rounded-xl hover:bg-red-600 transition-all"
              >
                Leave Battle
              </Button>
            ) : (
              <Button
                onPress={() => setIsOpenHeroPickDialog(true)}
                className="bg-purple-500 text-white font-bold px-8 py-6 rounded-xl hover:bg-purple-600 transition-all"
              >
                Join Battle
              </Button>
            )}

            <Button
              onPress={() => navigate('/play')}
              className="bg-neutral-800 text-white font-bold px-8 py-6 rounded-xl hover:bg-neutral-700 transition-all"
            >
              Back to Lobby
            </Button>
          </div>
        </div>

        <Modal
          isOpen={isOpenHeroPickDialog}
          onOpenChange={setIsOpenHeroPickDialog}
          className="dark"
          size="4xl"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-purple-400">Choose Your Hero</h2>
              <p className="text-sm text-neutral-400">Select a champion to enter battle</p>
            </ModalHeader>
            <ModalBody className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {myHero?.map((hero, index) => {
                  const isSelected = selectedHero?.id === hero.id;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedHero(hero)}
                      className={`bg-neutral-900 rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-neutral-700'
                        }`}
                    >
                      <div className="relative aspect-square">
                        <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900/60" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-white font-semibold text-sm">{hero.name}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                className="w-full mt-6 bg-purple-500 text-white font-bold py-6 rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50"
                onPress={handleJoinRoom}
                isDisabled={!currentRoom?.id || !selectedHero?.id || loading}
                isLoading={loading}
              >
                {loading ? 'Joining Battle...' : 'Enter Battle!'}
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

const RoomStateVisualizer = () => {
  const { currentRoom, joinRoom, leaveRoom } = useRoom()

  return (
    <div>
      <div>
        Room ID: {currentRoom?.id}
      </div>
      <div>
        Name: {currentRoom?.name}
      </div>
      <div>
        State: {currentRoom?.state}
      </div>

      <div>
        Hero1 ID: {currentRoom?.hero1?.id} | Hero2 ID: {currentRoom?.hero2?.id}
      </div>

      <Button
        onPress={() => {
          joinRoom(currentRoom?.id, 'cm6wde48n0008vd95uwkus09h')
        }}
      >
        Join with heroid
      </Button>

      <Button
        onPress={() => {
          leaveRoom()
        }}
      >
        Leave Room
      </Button>
    </div>
  )
}