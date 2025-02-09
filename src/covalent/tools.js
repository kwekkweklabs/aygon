import { Tool, createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import { prismaQuery } from "../../lib/prisma.js";

/**
 * Tool: getAfkUsersTool
 * Description: Fetches all user IDs with AFK mode activated.
 */
const getAfkUsers = async () => {
    const afkUsers = await prismaQuery.user.findMany({
        where: { isAfkMode: true },
    });
    // Return an array of user IDs
    return JSON.stringify(afkUsers.map(user => user.id));
};

const getAfkUsersTool = createTool({
    id: "getAfkUsers",
    description:
        "Fetches all user IDs for users with AFK mode activated using a Prisma query.",
    schema: z.object({}),
    execute: async () => {
        try {
            const data = await getAfkUsers();
            return data;
        } catch (error) {
            return JSON.stringify({ error: "Failed to fetch AFK users", details: error.message });
        }
    },
});

/**
 * Tool: getHeroesTool
 * Description: Retrieves hero configurations for a given user ID and calculates battle wins and losses.
 */
const GetHeroesInputSchema = z.object({
    userId: z.string(),
});

const getHeroes = async (params) => {
    const { userId } = GetHeroesInputSchema.parse(params);
    const heroes = await prismaQuery.hero.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    // For each hero, calculate win/lose counts from finished battles.
    for (let i = 0; i < heroes.length; i++) {
        const allBattles = await prismaQuery.battle.findMany({
            where: {
                OR: [{ hero1Id: heroes[i].id }, { hero2Id: heroes[i].id }],
                status: "FINISHED",
            },
            select: { id: true, winnerHeroId: true },
        });
        const winBattleCount = allBattles.filter(
            battle => battle.winnerHeroId === heroes[i].id
        ).length;
        const loseBattleCount = allBattles.filter(
            battle => battle.winnerHeroId !== heroes[i].id
        ).length;
        heroes[i].winBattleCount = winBattleCount;
        heroes[i].loseBattleCount = loseBattleCount;
    }
    return JSON.stringify(heroes);
};

const getHeroesTool = createTool({
    id: "getHeroes",
    description:
        "Fetches the hero configurations for a specified user (using userId) and includes battle win/lose counts.",
    schema: GetHeroesInputSchema,
    execute: async (params) => {
        try {
            const data = await getHeroes(params);
            return data;
        } catch (error) {
            return JSON.stringify({ error: "Failed to fetch heroes", details: error.message });
        }
    },
});

/**
 * Tool: getRoomsTool
 * Description: Retrieves a list of battle rooms that are in the 'WAITING' state and already have an opponent assigned.
 */
const getRooms = async () => {
    const rooms = await prismaQuery.room.findMany({
        where: {
            state: "WAITING",
            NOT: { hero1Id: null } // assumes hero1 is the opponent that must be present
        },
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            hero1: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    image: true,
                    user: {
                        select: { id: true, email: true, privyWalletAddress: true },
                    },
                },
            },
            hero2: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    image: true,
                    user: {
                        select: { id: true, email: true, privyWalletAddress: true },
                    },
                },
            },
            state: true,
            currentBattleId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return JSON.stringify(rooms);
};

const getRoomsTool = createTool({
    id: "getRooms",
    description:
        "Fetches a list of battle rooms that are in the 'WAITING' state and already have an opponent assigned.",
    schema: z.object({}),
    execute: async () => {
        try {
            const data = await getRooms();
            return data;
        } catch (error) {
            return JSON.stringify({ error: "Failed to fetch battle rooms", details: error.message });
        }
    },
});

/**
 * Tool: joinRoomTool
 * Description: Allows a hero to join a battle room by providing roomId and heroId.
 * Only rooms with state 'WAITING' (and an opponent already assigned) can be joined.
 */
const JoinRoomInputSchema = z.object({
    roomId: z.string(),
    heroId: z.string(),
});

const joinRoom = async (params) => {
    const { roomId, heroId } = JoinRoomInputSchema.parse(params);
    const room = await prismaQuery.room.findUnique({
        where: { id: roomId },
    });
    if (!room) {
        throw new Error(`Room ${roomId} not found`);
    }
    if (room.state === "PLAYING") {
        throw new Error(`Room ${roomId} is currently playing`);
    }
    if (room.hero1Id === heroId || room.hero2Id === heroId) {
        throw new Error(`Hero ${heroId} already joined the room ${roomId}`);
    }
    if (!room.hero1Id) {
        await prismaQuery.room.update({
            where: { id: roomId },
            data: { hero1Id: heroId },
        });
    } else if (!room.hero2Id) {
        await prismaQuery.room.update({
            where: { id: roomId },
            data: { hero2Id: heroId },
        });
    } else {
        throw new Error(`Room ${roomId} is full`);
    }
    return JSON.stringify({ message: `Hero ${heroId} joined room ${roomId}` });
};

const joinRoomTool = createTool({
    id: "joinRoom",
    description:
        "Allows a hero to join a battle room by providing roomId and heroId. Only rooms with state 'WAITING' and with an opponent already assigned are considered.",
    schema: JoinRoomInputSchema,
    execute: async (params) => {
        try {
            const data = await joinRoom(params);
            return data;
        } catch (error) {
            return JSON.stringify({ error: "Failed to join room", details: error.message });
        }
    },
});

// Export the tools for use in your agent or routes
export { getAfkUsersTool, getHeroesTool, getRoomsTool, joinRoomTool };
