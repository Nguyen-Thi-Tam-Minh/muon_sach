const { ObjectId } = require("mongodb");

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
    const r = await this.Reader.insertOne({
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.findById(r.insertedId);
  }

  async findAll() {
    return await this.Reader.find({}).toArray();
  }

  async findById(id) {
    return await this.Reader.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    const update = this.extract(payload);
    update.updatedAt = new Date();
    const result = await this.Reader.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }
}

module.exports = ReaderService;
