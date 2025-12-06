// const { MongoClient } = require("mongodb");

// class MongoDB {
//   static client;

//   static async connect(uri) {
//     if (this.client) return this.client;
//     this.client = await MongoClient.connect(uri, {
//       // các option an toàn, ổn định kết nối
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     return this.client;
//   }

//   static getClient() {
//     if (!this.client) throw new Error("MongoDB client has not been initialized");
//     return this.client;
//   }
// }

// module.exports = MongoDB;
const { MongoClient } = require("mongodb");

class MongoDB {
  static client;

  static async connect(uri) {
    if (this.client) return this.client;
    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return this.client;
  }

  static getClient() {
    if (!this.client)
      throw new Error("MongoDB client has not been initialized");
    return this.client;
  }

  // Hàm sinh ID số nguyên tự tăng
  static async generateId(collectionName, startSeq = 1) {
    const db = this.getClient().db();
    const result = await db.collection("counters").findOneAndUpdate(
      { _id: collectionName },
      { $inc: { seq: 1 }, $setOnInsert: { startSeq: startSeq } },
      { upsert: true, returnDocument: "after" } // Trả về document sau khi update
    );

    // Xử lý trường hợp mới khởi tạo (lần đầu tiên)
    // Nếu seq < startSeq (do $inc chạy trước khi set giá trị khởi điểm hợp lý), ta reset lại
    const seq = result.seq || result.value?.seq;

    // Nếu đây là lần đầu tạo (seq vừa được inc lên 1 từ null/0, hoặc nhỏ hơn startSeq)
    if (!seq || seq < startSeq) {
      await db
        .collection("counters")
        .updateOne({ _id: collectionName }, { $set: { seq: startSeq } });
      return startSeq;
    }
    return seq;
  }
}

module.exports = MongoDB;
