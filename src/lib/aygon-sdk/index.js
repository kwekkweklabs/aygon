import axios from "axios";

export class AygonSDK {
  apiKey = null;
  baseURL = null;
  headers = {
    "Content-Type": "application/json",
  };

  constructor(apiKey = "", baseURL = "https://api.aygon.fun") {
    if (apiKey) {
      this.headers = {
        ...this.headers,
        Authorization: `Bearer ${apiKey}`,
      };
    }
    this.client = axios.create({
      baseURL,
      headers: this.headers,
    });
  }

  async getUserHeroes({ signal }) {
    const heros = await this.client.get("/hero/my-hero", { signal });
    return heros.data;
  }

  async getRoomList({ signal }) {
    const heros = await this.client.get("/room/list", { signal });
    return heros.data;
  }
}
