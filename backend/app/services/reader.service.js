// const { ObjectId } = require("mongodb"); // Không dùng ObjectId cho _id độc giả nữa
const MongoDB = require("../utils/mongodb.util"); // Import MongoDB util

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("readers");
  }

  extract(payload) {
    const d = {
      hoLot: payload.hoLot,
      ten: payload.ten,
      ngaySinh: payload.ngaySinh ? new Date(payload.ngaySinh) : undefined,
      phai: payload.phai,
      diaChi: payload.diaChi,
      dienThoai: payload.dienThoai,
    };
    Object.keys(d).forEach((k) => d[k] === undefined && delete d[k]);
    return d;
  }

  async create(payload) {
    const doc = this.extract(payload);
    // SỬA: Sinh ID số cho độc giả (Bắt đầu từ 30000)
    doc._id = await MongoDB.generateId("readers", 30000);
    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    const r = await this.Reader.insertOne(doc);
    return await this.findById(r.insertedId);
  }

  async findAll() {
    return await this.Reader.find({}).toArray();
  }

  async findById(id) {
    // SỬA: Tìm theo ID số
    return await this.Reader.findOne({ _id: parseInt(id) });
  }

  async update(id, payload) {
    const update = this.extract(payload);
    update.updatedAt = new Date();
    // SỬA: Update theo ID số
    const result = await this.Reader.findOneAndUpdate(
      { _id: parseInt(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result; // result.value trong driver mới thường trả về trực tiếp doc hoặc null
  }
}

module.exports = ReaderService;
