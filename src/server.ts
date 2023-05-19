import express, { Express, Request, Response } from 'express'
import { config } from 'dotenv';

config();

import gamesRouter from './routes/games';
import { setPortNumber } from './bin/port';
import { addFirestore } from './middleware/firebase';

const app: Express = express();
const port = setPortNumber(process.env.PORT);

// Middleware to parse JSON bodies
app.use(express.json());

// Add Firestore to routes so it can validate sessions and fetch data
app.use(addFirestore);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Squid Golf API.');
});

app.use('/api/games', gamesRouter);

app.listen(port, () => {
    console.log(`App started on port: ${port}`);
});
