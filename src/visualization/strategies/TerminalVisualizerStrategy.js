import chalk from 'chalk';
import { BattleVisualizerStrategy } from './BattleVisualizerStrategy.js';
import { sleep } from '../../utils/helpers.js';

export class TerminalVisualizerStrategy extends BattleVisualizerStrategy {
    static aiProvider;

    initialize(aiProvider) {
        TerminalVisualizerStrategy.aiProvider = aiProvider;
    }

    async visualizeAction(action, attacker, defender, battleContext) {
        console.log('\n' + chalk.yellow.bold('═'.repeat(50)));
        console.log(chalk.cyan.bold(`\n${attacker.name} uses ${action.type}!`));

        const sequence = await this.getActionSequence(action, attacker, defender);
        await this.animateSequence(sequence);

        console.log('\n' + chalk.white.bold(`\n${action.text}`));
        console.log(chalk.magenta.dim('\n=== Battle Judge Commentary ==='));
        console.log(chalk.magenta.italic(action.judgeCommentary));

        if (action.damage > 0) {
            const damageText = action.crit ?
                chalk.red.bold(`CRITICAL! ${action.damage} damage!`) :
                chalk.red(`${action.damage} damage`);
            console.log('\n' + damageText);
        }

        if (action.effect && action.effect !== 'NONE') {
            await this.visualizeStatusEffect(action.effect, defender);
        }
    }

    async getActionSequence(action, attacker, defender) {
        if (!TerminalVisualizerStrategy.aiProvider) {
            return ['⚔️', '💫', '✨', '💥', '⭐'];
        }

        const prompt = `As a battle visualizer, create a sequence of 5 emojis that tell the story of this combat action.

        BATTLE ACTION:
        Attacker: ${attacker.name} (${attacker.description})
        Action Type: ${action.type}
        Action Description: ${action.text}
        Outcome: ${!action.miss ? 'Successful' : 'Failed'}

        REQUIREMENTS:
        1. Return EXACTLY 5 emojis separated by spaces
        2. Emojis should show action progression (setup → execution → impact)
        3. Make it thematic to the character's abilities`;

        try {
            const response = await TerminalVisualizerStrategy.aiProvider.generate(prompt);
            const sequence = response
                .replace(/["\[\]{}]/g, '')
                .trim()
                .split(/\s+/)
                .filter(emoji => emoji.length > 0)
                .slice(0, 5);

            while (sequence.length < 5) {
                sequence.push('✨');
            }

            return sequence;
        } catch (error) {
            console.error('Emoji Sequence Generation Error:', error);
            return ['⚔️', '💫', '✨', '💥', '⭐'];
        }
    }

    async visualizeStatusEffect(effect, target) {
        console.log(chalk.yellow.dim('\n=== Status Effect ==='));
        const sequence = await this.getStatusEffectSequence(effect, target);
        await this.animateSequence(sequence);
        console.log('\n');
    }

    async getStatusEffectSequence(effect, target) {
        if (!TerminalVisualizerStrategy.aiProvider) {
            return ['💫', '✨', '💫', '✨', '💫'];
        }

        const prompt = `As a battle visualizer, create a sequence of 5 emojis that represent this status effect.

        STATUS EFFECT: ${effect}
        Target: ${target.name} (${target.description})

        REQUIREMENTS:
        1. Return EXACTLY 5 emojis separated by spaces
        2. Emojis should show effect progression
        3. Make it thematic to the effect type`;

        try {
            const response = await TerminalVisualizerStrategy.aiProvider.generate(prompt);
            const sequence = response
                .replace(/["\[\]{}]/g, '')
                .trim()
                .split(/\s+/)
                .filter(emoji => emoji.length > 0)
                .slice(0, 5);

            while (sequence.length < 5) {
                sequence.push('✨');
            }

            return sequence;
        } catch (error) {
            console.error('Status Effect Sequence Generation Error:', error);
            return ['💫', '✨', '💫', '✨', '💫'];
        }
    }

    async animateSequence(sequence) {
        for (const emoji of sequence) {
            process.stdout.write('\r' + ' '.repeat(50));
            process.stdout.write('\r' + chalk.yellow.bold(`${emoji} `.repeat(5)));
            await sleep(200);
        }
    }

    getHealthBar(hp) {
        const barLength = 20;
        const filled = '█'.repeat((hp / 100) * barLength);
        const empty = '░'.repeat(barLength - filled.length);
        return `${filled}${empty} ${hp}%`;
    }

    getSpecialMeter(meter) {
        const barLength = 10;
        const filled = '■'.repeat((meter / 100) * barLength);
        const empty = '□'.repeat(barLength - filled.length);
        return `${filled}${empty} ${meter}%`;
    }

    displayBattleState(heroes, battleContext) {
        console.clear();
        console.log(chalk.yellow.bold('╔════════════════ BATTLE COMMENTARY ════════════════╗'));

        const commentary = battleContext.getCommentary();
        if (commentary.length === 0) {
            console.log(chalk.gray('\n     The battle is about to begin...'));
        } else {
            console.log('');
            commentary.forEach(comment => console.log(comment));
        }
        console.log('');

        for (const [id, hero] of Object.entries(heroes)) {
            console.log(chalk.cyan(`${hero.name}`));
            console.log(chalk.green(this.getHealthBar(hero.hp)));
            console.log(chalk.yellow(`Special: ${this.getSpecialMeter(battleContext.getSpecialMeter(id))}`));
            console.log('');
        }

        console.log(chalk.yellow.bold('╚═══════════════════════════════════════════════════╝'));
    }
}