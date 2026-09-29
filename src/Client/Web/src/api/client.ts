import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5260/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;