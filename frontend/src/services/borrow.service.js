// frontend/services/borrow.service.js
import createApiClient from "./api.service";
class BorrowService {
  constructor(baseUrl = "/api/borrows") {
    this.api = createApiClient(baseUrl);
  }
  async list(params) { return (await this.api.get("/", { params })).data; }
  async create(data) { return (await this.api.post("/", data)).data; }
  async approve(id, msnv) { return (await this.api.patch(`/${id}/approve`, { msnv })).data; }
  async markBorrowed(id) { return (await this.api.patch(`/${id}/mark-borrowed`)).data; }
  async markReturned(id) { return (await this.api.patch(`/${id}/mark-returned`)).data; }
}
export default new BorrowService();
