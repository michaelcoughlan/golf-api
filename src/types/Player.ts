export interface BasePlayer {
    name: string;
    uid?: string;
}

export interface IndexedPlayer extends BasePlayer {
    scorecardIndex: number;
}

export interface Player extends IndexedPlayer {
    totalScore: number;
}
