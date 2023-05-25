import { Request, Response } from 'express';

import { ErrorCodes, ErrorMessages } from '../types/Error';
import { BaseGame, Game, GamePayload } from '../types/Game';
import { Hole, HolePayload, HoleScore } from '../types/Hole';
import { BasePlayer, IndexedPlayer } from '../types/Player';
import { aggregatePlayerInformation } from '../utils';

export class GamesController {
    /**
     * Fetch all of the games for the given user id
     *
     * @param {Request} req the request object
     * @param {Response} res the response object
     * @returns {void} nothing
     *
     * @author Michael Coughlan
     */
    static async fetchGames(req: Request, res: Response) {
        try {
            const gamesRef = req.firestore.collection('games').where('userId', '==', req.user.uid);
            const gamesSnapshot = await gamesRef.get();

            // Respond with the data from each document
            const baseGames: BaseGame[] = gamesSnapshot.docs.map((doc) => {
                const tempGame = doc.data();

                return {
                    date: tempGame.date,
                    id: doc.id,
                    title: tempGame.title,
                };
            });

            res.status(200).json(baseGames);
        } catch (error) {
            console.error('Error fetching all games', error);
            res.status(ErrorCodes.ServerError).send(ErrorMessages.ServerError);
        }
    }

    /**
     * Fetch a single game for a given user
     *
     * @param {Request} req the request object
     * @param {Response} res the response object
     * @returns {void} nothing
     *
     * @author Michael Coughlan
     */
    static async fetchGame(req: Request, res: Response) {
        try {
            const gameId: string = req.params.id;
            // TODO - Needs to check the user ID too
            const gameRef = req.firestore.collection('games').doc(gameId);
            const gameSnapshot = await gameRef.get();

            // If the game cannot be found, return an error
            if (!gameSnapshot.exists) {
                return res.status(ErrorCodes.NotFound).send(ErrorMessages.NotFound);
            }

            // If the data in the snapshot cannot be recovered, return an error
            const gameData = gameSnapshot.data();
            if (!gameData) {
                console.error('Error occurred with data function.');
                return res.status(ErrorCodes.ServerError).send(ErrorMessages.ServerError);
            }

            const { holes, players } = aggregatePlayerInformation(gameData as Game);
            gameData.holes = holes;
            gameData.players = players;

            res.json(gameData);
        } catch (error) {
            console.error('Error fetching game', error);
            res.status(ErrorCodes.ServerError).send(ErrorMessages.ServerError);
        }
    }

    /**
     * Create a new game for the designated number of players
     *
     * @param {Request} req the request object
     * @param {Response} res the response object
     * @returns {void} nothing
     *
     * @author Michael Coughlan
     */
    static async createGame(req: Request, res: Response) {
        try {
            const { numberHoles, players, title } = req.body as GamePayload;
            const now = new Date().toISOString();
            const userId = req.user.uid;

            // Validate the request body
            if (
                (!numberHoles || numberHoles < 0) ||
                (!players || players.length < 1) ||
                !title
            ) {
                return res.status(ErrorCodes.BadRequest).send(ErrorMessages.BadRequest);
            }

            // Add the players and their index in the scorecard
            const indexedPlayers: IndexedPlayer[] = [];
            players.forEach((player: BasePlayer, index: number) => {
                indexedPlayers.push({
                    ...player,
                    scorecardIndex: index,
                })
            });

            // Set up the holes for the scorecard
            const tempHoles: Hole = {};
            for (let i = 1; i <= numberHoles; i++) {
                let holeScores: HoleScore[] = [];

                for (let player of indexedPlayers) {
                    holeScores.push({
                        score: null,
                        scorecardIndex: player.scorecardIndex,
                    });
                }

                tempHoles[i] = holeScores;
            }

            const game: Game = {
                date: now,
                holes: tempHoles,
                players: indexedPlayers,
                title,
                userId,
            };

            const createGameResponse = await req.firestore.collection('games').add(game);
            res.status(201).send(createGameResponse.id);
        } catch (error) {
            console.error('Error occurred creating a game', error);
            res.status(ErrorCodes.ServerError).send(ErrorMessages.ServerError);
        }
    }

    /**
     * Delete a game with the given ID
     *
     * @param {Request} req the request object
     * @param {Response} res the response object
     * @returns {void} nothing
     *
     * @author Michael Coughlan
     */
    static async deleteGame(req: Request, res: Response) {
        try {
            const gameId: string = req.params.id;
            // TODO - Needs to check the user ID too
            const gameRef = req.firestore.collection('games').doc(gameId);
            const gameSnapshot = await gameRef.get();

            // If the game is not found, return a not found error
            if (!gameSnapshot.exists) {
                return res.status(ErrorCodes.NotFound).send(ErrorMessages.NotFound);
            }

            await gameRef.delete();
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting game', error);
            res.status(ErrorCodes.ServerError).send(ErrorMessages.ServerError);
        }
    }

    /**
     * Update the scores for a given hole
     *
     * @param {Request} req the request object
     * @param {Response} res the response object
     * @returns {void} nothing
     *
     * @author Michael Coughlan
     */
    static async updateHoleScore(req: Request, res: Response) {
        try {
            const { id, holeId } = req.params;
            const { scores } = req.body;

            // TODO - Verify it is the correct user
            const gameRef = req.firestore.collection('games').doc(id);

            const holePayload: HolePayload = {};
            holePayload[`holes.${holeId}`] = scores;
 
            await gameRef.update(holePayload);

            res.send(`${id} - ${holeId} updated successfully`);
        } catch (error) {
            console.error('Error updating attribute', error);
            res.status(ErrorCodes.ServerError).send(ErrorMessages.ServerError);
        }
    }
}
