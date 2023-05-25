export interface Hole {
    [key: string]: HoleScore[];
}

export interface HoleScore {
    name?: string;
    score: number | null;
    scorecardIndex: number;
}

// The type sent to update Firestore entry
export interface HolePayload {
    [key: string]: HoleScore;
}
