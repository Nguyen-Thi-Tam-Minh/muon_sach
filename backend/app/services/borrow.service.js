const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrows");
    this.Book = client.db().collection("books");
    this.Reader = client.db().collection("readers");
  }

  extractBorrowData(payload) {
    const doc = {
      // SỬA: Chuyển sang parseInt thay vì ObjectId
      maDocGia: payload.maDocGia ? parseInt(payload.maDocGia) : undefined,
      maSach: payload.maSach ? parseInt(payload.maSach) : undefined,
      msnv: payload.msnv ? parseInt(payload.msnv) : undefined,

      status: payload.status,
      ngayMuon: payload.ngayMuon ? new Date(payload.ngayMuon) : undefined,
      ngayTra: payload.ngayTra ? new Date(payload.ngayTra) : undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
    };
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
  }

  async _assertReaderAndBook(maDocGia, maSach) {
    // SỬA: Tìm theo ID số
    const [reader, book] = await Promise.all([
      this.Reader.findOne({ _id: parseInt(maDocGia) }),
      this.Book.findOne({ _id: parseInt(maSach) }),
    ]);
    if (!reader) throw new Error("Reader not found");
    if (!book) throw new Error("Book not found");
    return { reader, book };
  }

  async create(payload) {
    const { maDocGia, maSach } = payload;
    await this._assertReaderAndBook(maDocGia, maSach);

    // SỬA: Query bằng số
    const existingBorrow = await this.Borrow.findOne({
      maDocGia: parseInt(maDocGia),
      maSach: parseInt(maSach),
      status: { $in: ["pending", "borrowed"] },
    });

    if (existingBorrow) {
      throw new Error("Bạn đã yêu cầu mượn sách này rồi.");
    }

    const lateReturnsCount = await this.Borrow.countDocuments({
      maDocGia: parseInt(maDocGia),
      status: "returned",
      $expr: { $gt: ["$ngayTra", "$dueDate"] },
    });

    if (lateReturnsCount > 3) {
      throw new Error("Bạn không được mượn sách do trả muộn quá 3 lần.");
    }

    const doc = {
      ...this.extractBorrowData(payload),
      status: "pending",
      ngayMuon: null,
      ngayTra: null,
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.Borrow.insertOne(doc);
    return await this.findById(result.insertedId);
  }

  async findAll({ status, maDocGia } = {}) {
    const filter = {};
    if (status) filter.status = status;
    // SỬA: Chuyển maDocGia sang số
    if (maDocGia) filter.maDocGia = parseInt(maDocGia);

    const pipeline = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "readers",
          localField: "maDocGia",
          foreignField: "_id",
          as: "reader",
        },
      },
      { $unwind: { path: "$reader", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "books",
          localField: "maSach",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
    ];

    return await this.Borrow.aggregate(pipeline).toArray();
  }

  async findById(id) {
    // ID của phiếu mượn vẫn giữ là ObjectId (không cần đổi sang số)
    return await this.Borrow.findOne({ _id: new ObjectId(id) });
  }

  async approve(id, { msnv }) {
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id), status: "pending" },
      {
        $set: {
          status: "approved",
          msnv: msnv ? parseInt(msnv) : null, // SỬA: msnv là số
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    if (!result) throw new Error("Borrow not found or not in 'pending'");
    return result;
  }

  async markBorrowed(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");

    if (!["approved", "pending"].includes(borrow.status)) {
      throw new Error("Invalid state transition to 'borrowed'");
    }

    const now = new Date();
    // SỬA: Query maDocGia là số
    const hasOverdue = await this.Borrow.findOne({
      maDocGia: borrow.maDocGia,
      status: "borrowed",
      dueDate: { $lt: now },
    });
    if (hasOverdue) {
      throw new Error(
        "Độc giả đang có sách mượn quá hạn, vui lòng trả trước khi mượn mới."
      );
    }

    // SỬA: Query maSach là số
    const book = await this.Book.findOne({ _id: borrow.maSach });
    if (!book) throw new Error("Book not found");
    if (!book.copies || book.copies <= 0) {
      throw new Error("Sách này đã hết, không thể cho mượn.");
    }

    await this.Book.updateOne(
      { _id: borrow.maSach, copies: { $gt: 0 } },
      { $inc: { copies: -1 } }
    );

    const dueDays = 25;
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000);

    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "borrowed",
          ngayMuon: now,
          dueDate,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );
    return result;
  }

  async markReturned(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");
    if (borrow.status !== "borrowed") {
      throw new Error("Only 'borrowed' can be returned");
    }

    await this.Book.updateOne({ _id: borrow.maSach }, { $inc: { copies: 1 } });

    const now = new Date();
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "returned",
          ngayTra: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Borrow.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result;
  }
}

module.exports = BorrowService;
