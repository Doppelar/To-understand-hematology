// Entry point for the Vercel function: the same Express routes as server/index.ts,
// without Vite or a listening server (Vercel serves the built client as static files).
import express, { type NextFunction, type Request, type Response } from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ready = registerRoutes(app).then(() => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(err.status || err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
  });
});

export default async function handler(req: Request, res: Response) {
  await ready;
  app(req, res);
}
