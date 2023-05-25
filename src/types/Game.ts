import { Hole } from './Hole';
import { BasePlayer, IndexedPlayer } from './Player';

export interface BaseGame {
    date: string;
    id: string;
    title: string;
}

export interface Game {
    date: string;
    holes: Hole;
    players: IndexedPlayer[];
    title: string;
    userId: string;
}

export interface GamePayload {
    numberHoles: number;
    players: BasePlayer[];
    title: string;
}
