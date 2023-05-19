import { Router } from 'express';

import { GamesController } from '../controllers/games';
import { authenticateToken } from '../middleware/firebase';

const router = Router();

// GET /games
router.get('/', authenticateToken, GamesController.fetchGames);

// GET /games/:id
router.get('/:id', authenticateToken, GamesController.fetchGame);

// DELETE /games/:id
router.delete('/:id', authenticateToken, GamesController.deleteGame);

// POST /games
router.post('/', authenticateToken, GamesController.createGame);

// PATCH /games/:id/holes/:holeId
router.patch('/:id/holes/:holeId', authenticateToken, GamesController.updateHoleScore)

export default router;
