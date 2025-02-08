export class BattleContextManager {
    constructor() {
        this.state = {
            heroStates: {},
            specialMeters: {},
            statusEffects: {},
            combo: 0,
            lastAction: null,
            currentTurn: 0,
            actionHistory: []
        };
        this.eventHandlers = {};
    }

    getBattleState() {
        return {
            heroes: this.state.heroStates,
            currentTurn: this.state.currentTurn,
            lastAction: this.state.lastAction,
            actionHistory: this.state.actionHistory,
            statusEffects: this.getAllStatusEffects(),
            specialMeters: this.getAllSpecialMeters(),
            combo: this.getCombo()
        };
    }

    // Add action to history
    addToHistory(action) {
        this.state.actionHistory.push(action);
        this.state.lastAction = action;
    }

    // Hero Initialization
    initializeHero(heroId) {
        if (!this.state.heroStates[heroId]) {
            this.state.heroStates[heroId] = {
                health: 100,
                effects: []
            };
        }
    }

    // Special Meter Management
    initializeSpecialMeter(heroId) {
        this.state.specialMeters[heroId] = 0;
    }

    updateSpecialMeter(heroId, amount) {
        if (!this.state.specialMeters[heroId]) {
            this.state.specialMeters[heroId] = 0;
        }
        this.state.specialMeters[heroId] = Math.min(100,
            Math.max(0, this.state.specialMeters[heroId] + amount));
    }

    getSpecialMeter(heroId) {
        return this.state.specialMeters[heroId] || 0;
    }

    getAllSpecialMeters() {
        return { ...this.state.specialMeters };
    }

    // Status Effects Management
    initializeStatusEffects(heroId) {
        this.state.statusEffects[heroId] = [];
    }

    addStatusEffect(heroId, effect) {
        if (!this.state.statusEffects[heroId]) {
            this.state.statusEffects[heroId] = [];
        }
        this.state.statusEffects[heroId].push({
            ...effect,
            turnAdded: this.state.currentTurn
        });
    }

    processStatusEffects(heroId) {
        if (!this.state.statusEffects[heroId]) {
            return { damage: 0, modifier: 1.0 };
        }

        let totalDamage = 0;
        let totalModifier = 1.0;

        // Process and update effects
        this.state.statusEffects[heroId] = this.state.statusEffects[heroId]
            .filter(effect => {
                const isActive = effect.duration > 0;
                if (isActive) {
                    totalDamage += effect.damage || 0;
                    totalModifier *= effect.modifier || 1.0;
                    effect.duration--;
                }
                return isActive;
            });

        return {
            damage: totalDamage,
            modifier: totalModifier
        };
    }

    getAllStatusEffects() {
        return { ...this.state.statusEffects };
    }

    // Combo System
    updateCombo(hit) {
        if (hit) {
            this.state.combo++;
        } else {
            this.state.combo = 0;
        }
        return this.state.combo;
    }

    getCombo() {
        return this.state.combo;
    }

    // Action History
    setLastAction(action) {
        this.state.lastAction = action;
        this.addToHistory(action);
    }

    getLastAction() {
        return this.state.lastAction;
    }

    // Turn Management
    setCurrentTurn(turn) {
        this.state.currentTurn = turn;
    }

    getCurrentTurn() {
        return this.state.currentTurn;
    }

    // Battle Commentary
    addCommentary(text) {
        this.emit('COMMENTARY_ADDED', text);
    }

    // Event System
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event, data) {
        const handlers = this.eventHandlers[event];
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
}