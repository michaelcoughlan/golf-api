declare namespace Express {
    export interface Request {
        firestore: FirebaseFirestore.Firestore;
        user: any; // TODO - Add the real user structure when found
    }
}
