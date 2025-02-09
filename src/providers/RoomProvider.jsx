import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import axios from 'axios';

const RoomContext = createContext(null);

const RoomState = {
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED'
};

export const RoomProvider = ({ children }) => {
  const { accessToken } = useAuth();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const pollIntervalRef = useRef(null);
  const listPollIntervalRef = useRef(null);
  const isInitialMount = useRef(true);

  const fetchRoomList = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/room/list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setRoomList(res.data);
    } catch (err) {
      console.error('Failed to fetch room list:', err);
    }
  };

  const fetchRoomDetails = async (roomId) => {
    try {
      console.log('Fetching room details for:', roomId);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/room/detail/${roomId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Fetched room details:', res.data);
      setCurrentRoom(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch room details:', err);
      throw err;
    }
  };

  const joinRoom = async (roomId, heroId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Joining room:', roomId, 'with hero:', heroId);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/room/${roomId}/join`,
        { heroId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const roomData = await fetchRoomDetails(roomId);
      setCurrentRoom(roomData);
      startPolling(roomId);
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err.response?.data?.message || 'Failed to join room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom?.id) return;

    try {
      console.log('Leaving room:', currentRoom.id);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/room/${currentRoom.id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      navigate('/play');
    } catch (err) {
      console.error('Failed to leave room:', err);
    } finally {
      stopPolling();
      setCurrentRoom(null);
    }
  };

  const startPolling = (roomId) => {
    console.log('Starting to poll room:', roomId);
    stopPolling();

    // Immediate first poll
    fetchRoomDetails(roomId).catch(console.error);

    pollIntervalRef.current = setInterval(async () => {
      try {
        await fetchRoomDetails(roomId);
      } catch (err) {
        console.error('Error during room polling:', err);
        if (err.response?.status === 404) {
          stopPolling();
          setCurrentRoom(null);
          navigate('/play');
        }
      }
    }, 1500);
  };

  const stopPolling = () => {
    console.log('Stopping room polling');
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startListPolling = () => {
    console.log('Starting list polling');
    fetchRoomList();
    if (listPollIntervalRef.current) {
      clearInterval(listPollIntervalRef.current);
    }
    listPollIntervalRef.current = setInterval(fetchRoomList, 3000);
  };

  const stopListPolling = () => {
    console.log('Stopping list polling');
    if (listPollIntervalRef.current) {
      clearInterval(listPollIntervalRef.current);
      listPollIntervalRef.current = null;
    }
  };

  // Initialize room list polling only once
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('RoomProvider mounted (initial)');
      isInitialMount.current = false;
      startListPolling();
    }

    return () => {
      if (!isInitialMount.current) {
        console.log('RoomProvider unmounting (final)');
        stopListPolling();
        stopPolling();
        if (currentRoom?.id) {
          leaveRoom();
        }
      }
    };
  }, []);

  useEffect(() => {
    const isRoomRoute = location.pathname.startsWith('/room/');

    if (isRoomRoute) {
      const roomId = location.pathname.split('/')[2];
      if (roomId) {
        startPolling(roomId);
      }
    } else {
      stopPolling();
    }
  }, [location.pathname]);

  const value = {
    currentRoom,
    roomList,
    loading,
    error,
    joinRoom,
    leaveRoom,
    isInRoom: !!currentRoom,
    roomState: currentRoom?.state || null,
    refreshRoomList: fetchRoomList
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook to use the room context
export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};