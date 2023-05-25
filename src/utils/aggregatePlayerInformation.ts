import { Game } from '../types/Game';
import { Hole, HoleScore } from '../types/Hole';
import { IndexedPlayer, Player } from '../types/Player';

/**
 * Take in a game detail and add the total score so far for the players and include the
 * player name in the hole scores
 *
 * @param {Game} game the game we want to calculate on
 * @returns { { holes: Hole, players: Player[] }} the game with additions to players and holes
 *
 * @author Michael Coughlan
 */
export default (game: Game): { holes: Hole, players: Player[] } => {
    const updatedHoles = { ...game.holes };
    const updatedPlayers: Player[] = [];

    // Loop through the players and get their scorecardIndex
    game.players.forEach((player: IndexedPlayer) => {
        const scoredPlayer: Player = {
            ...player,
            totalScore: 0,
        };

        // Loop through the keys of the holes
        Object.keys(updatedHoles).forEach((key: string) => {
            // Reference the hole object instead of the key
            const hole = updatedHoles[key];

            // Find the relevant player from this iteration of the loop in the hole's scores
            const relevantHoleScore = hole.find((holeScore: HoleScore) => player.scorecardIndex === holeScore.scorecardIndex);
            if (relevantHoleScore) {
                relevantHoleScore.name = player.name;
                scoredPlayer.totalScore += relevantHoleScore.score ?? 0;
            }
        });

        updatedPlayers.push(scoredPlayer);
    });

    return {
        holes: updatedHoles,
        players: updatedPlayers,
    };
};
