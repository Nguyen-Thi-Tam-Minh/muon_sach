import createApiClient from "./api.service";
class ReaderService {
  constructor(baseUrl = "/api/readers") { this.api = createApiClient(baseUrl); }
  async create(data) { return (await this.api.post("/", data)).data; }
  async list() { return (await this.api.get("/")).data; }
}
export default new ReaderService();
