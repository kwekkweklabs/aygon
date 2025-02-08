export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

export const calculateDamageRange = (baseDamage, variance = 0.2) => {
    const min = Math.floor(baseDamage * (1 - variance));
    const max = Math.ceil(baseDamage * (1 + variance));
    return { min, max };
};