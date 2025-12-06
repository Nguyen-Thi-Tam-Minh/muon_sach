const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrows");
    this.Book = client.db().collection("books");
    this.Reader = client.db().collection("readers");
    this.Staff = client.db().collection("staff"); // chưa dùng
  }

  extractBorrowData(payload) {
    const doc = {
      maDocGia: payload.maDocGia ? new ObjectId(payload.maDocGia) : undefined,
      maSach: payload.maSach ? new ObjectId(payload.maSach) : undefined,
      status: payload.status,
      ngayMuon: payload.ngayMuon ? new Date(payload.ngayMuon) : undefined,
      ngayTra: payload.ngayTra ? new Date(payload.ngayTra) : undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      msnv: payload.msnv ? new ObjectId(payload.msnv) : undefined,
    };
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
  }

  async _assertReaderAndBook(maDocGia, maSach) {
    const [reader, book] = await Promise.all([
      this.Reader.findOne({ _id: new ObjectId(maDocGia) }),
      this.Book.findOne({ _id: new ObjectId(maSach) }),
    ]);
    if (!reader) throw new Error("Reader not found");
    if (!book) throw new Error("Book not found");
    return { reader, book };
  }

  // tạo yêu cầu mượn (pending)
  async create(payload) {
    const { maDocGia, maSach } = payload;
    await this._assertReaderAndBook(maDocGia, maSach);

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
    if (maDocGia) filter.maDocGia = new ObjectId(maDocGia);
    return await this.Borrow.find(filter)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findById(id) {
    return await this.Borrow.findOne({ _id: new ObjectId(id) });
  }

  // duyệt -> approved
  async approve(id, { msnv }) {
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id), status: "pending" },
      {
        $set: {
          status: "approved",
          msnv: msnv ? new ObjectId(msnv) : null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    if (!result) throw new Error("Borrow not found or not in 'pending'");
    return result;
  }

  // xác nhận đã mượn -> borrowed (trừ copies + set dueDate)
  async markBorrowed(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");
    if (!["approved", "pending"].includes(borrow.status)) {
      throw new Error("Invalid state transition to 'borrowed'");
    }

    // 1) Kiểm tra số sách đang mượn
    const maxBorrow = 3;
    const currentBorrowing = await this.Borrow.countDocuments({
      maDocGia: borrow.maDocGia,
      status: "borrowed",
    });
    if (currentBorrowing >= maxBorrow) {
      throw new Error("Reader has reached maximum borrowed books");
    }

    // 2) Kiểm tra quá hạn
    const now = new Date();
    const hasOverdue = await this.Borrow.findOne({
      maDocGia: borrow.maDocGia,
      status: "borrowed",
      dueDate: { $lt: now },
    });
    if (hasOverdue) {
      throw new Error("Reader has overdue borrowed books");
    }

    // 3) Kiểm tra sách
    const book = await this.Book.findOne({ _id: borrow.maSach });
    if (!book) throw new Error("Book not found");
    if (!book.copies || book.copies <= 0) {
      throw new Error("No copies available");
    }

    // 4) Trừ copies
    await this.Book.updateOne(
      { _id: borrow.maSach, copies: { $gt: 0 } },
      { $inc: { copies: -1 } }
    );

    const dueDays = 14; // cho mượn 14 ngày
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
    return result.value;
  }

  // xác nhận đã trả -> returned (cộng copies)
  async markReturned(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");
    if (borrow.status !== "borrowed") {
      throw new Error("Only 'borrowed' can be returned");
    }

    await this.Book.updateOne(
      { _id: borrow.maSach },
      { $inc: { copies: 1 } }
    );

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
    return result.value;
  }
}

module.exports = BorrowService;
