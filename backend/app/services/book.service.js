const { ObjectId } = require("mongodb");

class BookService {
  constructor(client) {
    this.Book = client.db().collection("books");
  }

  // Chuẩn hóa dữ liệu đầu vào, chỉ lấy các field hợp lệ
  extractBookData(payload) {
    const book = {
      title: payload.title,
      author: payload.author,
      price: typeof payload.price === "number" ? payload.price : undefined,
      copies: typeof payload.copies === "number" ? payload.copies : undefined, // Số quyển
      publisher: payload.publisher,
      publishedYear:
        typeof payload.publishedYear === "number" ? payload.publishedYear : undefined,
      tags: Array.isArray(payload.tags) ? payload.tags : undefined,
      // có thể thêm fields khác từ lược đồ sau này
    };

    Object.keys(book).forEach(
      (k) => book[k] === undefined && delete book[k]
    );
    return book;
  }

  async create(payload) {
    const doc = this.extractBookData(payload);
    const result = await this.Book.insertOne({
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.findById(result.insertedId);
  }

  async findAll({ q }) {
    // q = text search theo title/author/publisher
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { author: { $regex: q, $options: "i" } },
            { publisher: { $regex: q, $options: "i" } },
            { tags: { $elemMatch: { $regex: q, $options: "i" } } },
          ],
        }
      : {};
    return await this.Book.find(filter).sort({ createdAt: -1 }).toArray();
  }

  async findById(id) {
    return await this.Book.findOne({ _id: new ObjectId(id) });
  }

  async update(id, payload) {
    const update = this.extractBookData(payload);
    const result = await this.Book.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Book.findOneAndDelete({ _id: new ObjectId(id) });
    return result;
  }

  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return { deletedCount: result.deletedCount };
  }
}

module.exports = BookService;