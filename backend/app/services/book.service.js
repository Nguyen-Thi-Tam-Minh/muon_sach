const { ObjectId } = require("mongodb");
const MongoDB = require("../utils/mongodb.util");

class BookService {
  constructor(client) {
    this.Book = client.db().collection("books");
  }

  extractBookData(payload) {
    const book = {
      title: payload.title,
      author: payload.author,
      // SỬA: Thêm trường description
      description: payload.description,
      image: payload.image,
      price: typeof payload.price === "number" ? payload.price : undefined,
      copies: typeof payload.copies === "number" ? payload.copies : undefined,
      // maNXB là số nguyên
      maNXB: payload.maNXB ? parseInt(payload.maNXB) : undefined,
      publishedYear:
        typeof payload.publishedYear === "number"
          ? payload.publishedYear
          : undefined,
      tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    };

    Object.keys(book).forEach((k) => book[k] === undefined && delete book[k]);
    return book;
  }

  async create(payload) {
    const doc = this.extractBookData(payload);
    // Sinh MASACH bắt đầu từ 10000
    doc._id = await MongoDB.generateId("books", 10000);
    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    const result = await this.Book.insertOne(doc);
    return await this.findById(doc._id);
  }

  async findAll({ q }) {
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { author: { $regex: q, $options: "i" } },
          ],
        }
      : {};
    return await this.Book.find(filter).sort({ createdAt: -1 }).toArray();
  }

  async findById(id) {
    return await this.Book.findOne({ _id: parseInt(id) });
  }

  async update(id, payload) {
    const update = this.extractBookData(payload);
    const result = await this.Book.findOneAndUpdate(
      { _id: parseInt(id) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Book.findOneAndDelete({ _id: parseInt(id) });
    return result;
  }

  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return { deletedCount: result.deletedCount };
  }
}

module.exports = BookService;
