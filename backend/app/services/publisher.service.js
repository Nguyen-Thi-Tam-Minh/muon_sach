const { ObjectId } = require("mongodb");

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("publishers");
  }

  extract(payload) {
    const publisher = {
      name: payload.name,
      address: payload.address,
    };
    // Xóa các trường undefined
    Object.keys(publisher).forEach(
      (k) => publisher[k] === undefined && delete publisher[k]
    );
    return publisher;
  }

  async create(payload) {
    const doc = this.extract(payload);
    const result = await this.Publisher.insertOne(doc);
    return await this.findById(result.insertedId);
  }

  async findAll() {
    return await this.Publisher.find({}).toArray();
  }

  async findById(id) {
    return await this.Publisher.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    const update = this.extract(payload);
    const result = await this.Publisher.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Publisher.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result;
  }
}

module.exports = PublisherService;
