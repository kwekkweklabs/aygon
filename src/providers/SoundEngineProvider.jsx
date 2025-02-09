import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import useSound from 'use-sound';

const SoundContext = createContext();

const SOUNDS = [
  'hammer', 'bomb-explode', 'whoosh', 'cute-uwu', 'slip-and-fall',
  'evil-cute-laugh', 'thunder', 'spit-splat', 'boing-bounce', 'buzzer-button',
  'scary-haunting', 'gunshot', 'water-splash', 'anime-kameha-explode',
  'throwing', 'tomato-squash', 'winky-face', 'magic-wand-fairy',
  'cute-girl-hey', 'nya-cute-girl', 'asian-gong', 'slap', 'cash',
  'quack', 'mario-jump', 'bone-crack', 'rizz', 'fart', 'pewpew'
];

export const SoundProvider = ({ children }) => {
  // Initialize background music hook separately with loop option
  const [playBgMusic, { stop: stopBgMusic, sound: bgSound }] = useSound('/assets/audio/bg-music.mp3', {
    volume: 0.3, // Lower volume for background music
    interrupt: false, // Don't interrupt itself
    loop: true, // Enable looping
    soundEnabled: true,
    preload: true,
    onload: () => console.log('Background music loaded'),
    onloaderror: (err) => console.error('Error loading background music:', err)
  });

  // Create sound effect hooks
  const sounds = Object.fromEntries(
    SOUNDS.map(sound => [
      sound,
      useSound(`/assets/audio/${sound}.mp3`, {
        volume: 0.5,
        interrupt: true,
        soundEnabled: true,
        preload: true,
        onload: () => console.log(`Sound loaded: ${sound}`),
        onloaderror: (err) => console.error(`Error loading sound ${sound}:`, err)
      })
    ])
  );

  useEffect(() => {
    console.log('Available sounds:', sounds);
    return () => {
      // Cleanup background music on unmount
      stopBgMusic();
    };
  }, [sounds, stopBgMusic]);

  const playSound = useCallback((soundNames) => {
    try {
      const names = Array.isArray(soundNames) ? soundNames : [soundNames];
      console.log('Attempting to play sounds:', names);
      
      names.forEach(name => {
        const cleanName = name.replace('.mp3', '');
        const soundHook = sounds[cleanName];
        
        if (!soundHook) {
          console.warn(`Sound not found: ${cleanName}`);
          return;
        }
        const [play, { sound, isPlaying }] = soundHook;
        console.log('Sound hook:', { name: cleanName, sound, isPlaying });
        
        if (play) {
          play();
          console.log(`Successfully called play() for ${cleanName}`);
        } else {
          console.error(`Play function not available for ${cleanName}`);
        }
      });
    } catch (error) {
      console.error('Error playing sounds:', error);
    }
  }, [sounds]);

  const stopSound = useCallback((soundNames) => {
    try {
      const names = Array.isArray(soundNames) ? soundNames : [soundNames];
      
      names.forEach(name => {
        const cleanName = name.replace('.mp3', '');
        const [_, { stop }] = sounds[cleanName] || [];
        if (stop) {
          stop();
          console.log(`Stopped sound: ${cleanName}`);
        }
      });
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  }, [sounds]);

  const stopAllSounds = useCallback(() => {
    try {
      // Stop all sound effects
      Object.entries(sounds).forEach(([name, [_, { stop }]]) => {
        if (stop) {
          stop();
          console.log(`Stopped sound: ${name}`);
        }
      });
      // Also stop background music
      stopBgMusic();
      console.log('Stopped background music');
    } catch (error) {
      console.error('Error stopping all sounds:', error);
    }
  }, [sounds, stopBgMusic]);

  const value = useMemo(() => ({
    playSound,
    stopSound,
    stopAllSounds,
    playBgMusic,
    stopBgMusic,
    sounds: SOUNDS
  }), [playSound, stopSound, stopAllSounds, playBgMusic, stopBgMusic]);

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

export const useGameSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useGameSound must be used within a SoundProvider');
  }
  return context;
};