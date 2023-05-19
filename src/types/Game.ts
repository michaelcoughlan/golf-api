export interface Game {
    date: string;
    holes: Hole;
    players: IndexedPlayer[];
    title: string;
    userId: string;
}

export interface GameRequestPayload {
    numberHoles: number;
    players: Player[];
    title: string;
}

export interface Hole {
    [key: number]: HoleScore[];
}

export interface HoleScore {
    score: number | null;
    scorecardIndex: number;
}

// The type sent to update Firestore entry
export interface HolePayload {
    [key: string]: HoleScore;
}

export interface Player {
    name: string;
    uid?: string;
}

export interface IndexedPlayer extends Player {
    scorecardIndex: number;
}
