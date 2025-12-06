import createApiClient from "./api.service";

class UserService {
  constructor(baseUrl = "/api/users") {
    this.api = createApiClient(baseUrl);
  }
  async list() { return (await this.api.get("/")).data; }
  async create(data) { return (await this.api.post("/", data)).data; }
  async update(id, data) { return (await this.api.put(`/${id}`, data)).data; }
  async delete(id) { return (await this.api.delete(`/${id}`)).data; }
}
export default new UserService();
