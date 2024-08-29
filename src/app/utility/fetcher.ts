import axios from "axios";

export const fetcher = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_HOST || "",
  adapter: "fetch",
});
