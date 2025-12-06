const { MongoClient } = require("mongodb");

class MongoDB {
  static client;

  static async connect(uri) {
    if (this.client) return this.client;
    this.client = await MongoClient.connect(uri, {
      // các option an toàn, ổn định kết nối
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return this.client;
  }

  static getClient() {
    if (!this.client) throw new Error("MongoDB client has not been initialized");
    return this.client;
  }
}

module.exports = MongoDB;