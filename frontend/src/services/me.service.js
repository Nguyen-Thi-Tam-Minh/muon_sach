import createApiClient from "./api.service";

class MeService {
  constructor(baseUrl = "/api/me") {
    this.api = createApiClient(baseUrl);
  }

  async getProfile() {
    return (await this.api.get("/profile")).data;
  }

  async updateProfile(data) {
    return (await this.api.put("/profile", data)).data;
  }

  async changePassword(payload) {
    return (await this.api.put("/password", payload)).data;
  }
}

export default new MeService();
