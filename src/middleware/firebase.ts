import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { ErrorCodes, ErrorMessages } from '../types/Error';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

export const addFirestore = (req: Request, res: Response, next: NextFunction) => {
    req.firestore = firestore;

    next();
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(ErrorCodes.Unauthorized).send(ErrorMessages.Unauthorized);
        }

        req.user = {
            email: 'test@email.com',
            uid: 'sample-uid',
        };

        // TODO - Use the user from OAuth
        // const decodedToken = await admin.auth().verifyIdToken(Array.isArray(token) ? token[0] : token);
        // req.user = decodedToken;

        next();
    } catch (error) {
        console.error('Error authenticating user', error);
        res.status(ErrorCodes.Unauthorized).send(ErrorMessages.Unauthorized);
    }
};
