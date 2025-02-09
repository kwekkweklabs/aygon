import { useRoom } from '@/providers/RoomProvider'
import { Button } from '@heroui/react'
import React from 'react'

export default function RoomPage() {

  return (
    <div className='min-h-screen pt-[8rem]'>
      <h1>
        Room Page
      </h1>
      <div className='mt-8'>
        <RoomStateVisualizer />
      </div>
    </div>
  )
}

const RoomStateVisualizer = () => {
  const { currentRoom, joinRoom, leaveRoom } = useRoom()

  console.log('Room State', currentRoom)

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