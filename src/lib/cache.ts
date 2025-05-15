import { cache } from "react";
import { auth } from "./auth";

export const authCache = cache(auth);
