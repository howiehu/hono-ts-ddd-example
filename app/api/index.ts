import { Hono } from "hono";
import root from "./root.route.js";

const app = new Hono();

app.route("/", root);

export default app;
