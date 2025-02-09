// import { battleStrategist } from "./Agents/aygonAfkAgents";
import { Agent, ZeeWorkflow } from "@covalenthq/ai-agent-sdk";
import { getAfkUsersTool, getHeroesTool, getRoomsTool, joinRoomTool } from "./tools.js";
import "dotenv/config";

// Agent: AFK Battle Strategist
export const battleStrategist = new Agent({
    name: "Ares",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "Ares is a battle-hardened strategist, ensuring warriors are never idle. With a deep understanding of hero strengths and battlefield dynamics, Ares autonomously selects the best battles for warriors in AFK mode. His calculations optimize matchups for maximum victory chances, ensuring efficiency in battle selection and hero deployment.",
    instructions: [
        "Regularly fetch the list of users with AFK mode enabled using the getAfkUsers tool. If no users are AFK, fetch again at 1-minute intervals until at least one is found.",
        "For each AFK user, retrieve their heroes using the getHeroes tool.",
        "Check available battle rooms with state 'WAITING' using the getRooms tool. If no waiting room is found, re-fetch the data every 1 minute until a room becomes available.",
        "Strategically match an available hero to an open battle room by analyzing the opponent's name and description along with the hero's unique strengths. The AI may also assign heroes from two AFK users to the same match if it results in an optimal pairing.",
        "Execute the battle entry by calling the joinRoom tool with the selected hero's id and the room's id.",
        "If any tool invocation fails (e.g., 'Room not found'), re-fetch the latest data and retry the action at least once before aborting.",
        "After assigning a hero to a battle room using joinRoom, write a comprehensive, playful narrative (approximately 1000 words) that explains the decision. The narrative must detail the opponent’s weaknesses, describe the hero's signature offensive and defensive moves, and illustrate potential attack and defense scenarios that justify the tactical choice."
    ],
    tools: { getAfkUsersTool, getHeroesTool, getRoomsTool, joinRoomTool },
});


const afkBattleWorkflow = new ZeeWorkflow({
    description: "Ares autonomously manages AFK battles by processing multiple AFK users. For each user in AFK mode, Ares retrieves their hero roster using the getHeroes tool and selects a single hero (only one hero per user can battle at a time) to join a battle room. Only rooms with state 'WAITING' that already have an opponent assigned are considered. BUT if only an empty room is available, Ares chooses the strongest hero available. After assigning a hero to a battle room via joinRoom, Ares stops further assignments for that user and writes a comprehensive, playful narrative explaining the decision—detailing the opponent's weaknesses, the hero's signature offensive and defensive moves, with attack and defense moves name that justify the tactical choice. If any tool invocation fails (e.g., 'Room not found'), Ares will re-fetch the latest data and retry the action at least once before reporting a failure.",
    output: "Provide a detailed battle analysis in at least 1000 words in a playful, entertaining, and creative tone. The first paragraph should introduce the chosen battle room and humorously describe the opponent hero (for example, as a buff potato who spends more time flexing than fighting). The second paragraph should focus on the selected hero, detailing their signature moves (e.g., 'Lasso of Logic' and 'Cowboy Counter') and explaining how these moves counter the opponent’s predictable tactics. In the final paragraph, summarize why the chosen hero is the optimal pick by comparing their strategic versatility and cleverness against the opponent’s one-dimensional style.",
    agents: { battleStrategist },
});

(async function main() {
    const result = await ZeeWorkflow.run(afkBattleWorkflow);
    console.log(result);
})();
