import express, {Request, Response } from "express";
import router from './routes/index';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

// body-parser
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req: Request, res: express.Response) => {
  res.send("Express + TypeScript Server");
});

app.use('/api',router)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});