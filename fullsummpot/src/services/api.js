import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5242/api",
});

export default API;