import createApiClient from "./api.service";

class AuthService {
  constructor(baseUrl = "/api/auth") {
    this.api = createApiClient(baseUrl);
  }

  async login(username, password) {
    return (await this.api.post("/login", { username, password })).data;
  }

  async register(payload) {
    // payload: { username, password, hoLot?, ten?, dienThoai?, phai?, diaChi? }
    return (await this.api.post("/register", payload)).data;
  }
}

export default new AuthService();
