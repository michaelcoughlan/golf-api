import { Request, Response } from 'express';

import { ErrorCodes, ErrorMessages } from '../types/Error';
import { Game, GameRequestPayload, Hole, HolePayload, HoleScore, IndexedPlayer, Player } from '../types/Game';

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
            res.status(200).json(gamesSnapshot.docs.map((doc) => doc.data()));
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

            res.json(gameSnapshot.data());
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
            const { numberHoles, players, title } = req.body as GameRequestPayload;
            const now = new Date().toISOString();
            const userId = req.user.uid;

            // Validate the request body
            if ((!numberHoles || numberHoles < 0) || !players || !title) {
                return res.status(ErrorCodes.BadRequest).send(ErrorMessages.BadRequest);
            }

            // Add the players and their index in the scorecard
            const indexedPlayers: IndexedPlayer[] = [];
            players.forEach((player: Player, index: number) => {
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
