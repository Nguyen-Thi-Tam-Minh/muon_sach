import createApiClient from "./api.service";

class StatsService {
  constructor(baseUrl = "/api/stats") {
    this.api = createApiClient(baseUrl);
  }

  async getOverview() {
    return (await this.api.get("/")).data;
  }
}

export default new StatsService();
