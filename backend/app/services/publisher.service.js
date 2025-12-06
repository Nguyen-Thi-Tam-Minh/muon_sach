// const { ObjectId } = require("mongodb");

// class PublisherService {
//   constructor(client) {
//     this.Publisher = client.db().collection("publishers");
//   }

//   extract(payload) {
//     const publisher = {
//       name: payload.name,
//       address: payload.address,
//     };
//     // Xóa các trường undefined
//     Object.keys(publisher).forEach(
//       (k) => publisher[k] === undefined && delete publisher[k]
//     );
//     return publisher;
//   }

//   async create(payload) {
//     const doc = this.extract(payload);
//     const result = await this.Publisher.insertOne(doc);
//     return await this.findById(result.insertedId);
//   }

//   async findAll() {
//     return await this.Publisher.find({}).toArray();
//   }

//   async findById(id) {
//     return await this.Publisher.findOne({ _id: new ObjectId(id) });
//   }

//   async update(id, payload) {
//     const update = this.extract(payload);
//     const result = await this.Publisher.findOneAndUpdate(
//       { _id: new ObjectId(id) },
//       { $set: update },
//       { returnDocument: "after" }
//     );
//     return result;
//   }

//   async delete(id) {
//     const result = await this.Publisher.findOneAndDelete({
//       _id: new ObjectId(id),
//     });
//     return result;
//   }
// }

// module.exports = PublisherService;
const MongoDB = require("../utils/mongodb.util");

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("publishers");
  }

  extract(payload) {
    const publisher = {
      name: payload.name,
      address: payload.address,
    };
    Object.keys(publisher).forEach(
      (k) => publisher[k] === undefined && delete publisher[k]
    );
    return publisher;
  }

  async create(payload) {
    const doc = this.extract(payload);
    // Sinh MANXB bắt đầu từ 1000
    doc._id = await MongoDB.generateId("publishers", 1000);

    const result = await this.Publisher.insertOne(doc);
    return await this.findById(doc._id);
  }

  async findAll() {
    return await this.Publisher.find({}).toArray();
  }

  async findById(id) {
    // ID giờ là số nguyên
    return await this.Publisher.findOne({ _id: parseInt(id) });
  }

  async update(id, payload) {
    const update = this.extract(payload);
    const result = await this.Publisher.findOneAndUpdate(
      { _id: parseInt(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Publisher.findOneAndDelete({
      _id: parseInt(id),
    });
    return result;
  }
}

module.exports = PublisherService;
