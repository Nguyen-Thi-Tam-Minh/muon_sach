const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrows");
    this.Book = client.db().collection("books");
    this.Reader = client.db().collection("readers");
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

  // Tạo yêu cầu mượn
  async create(payload) {
    const { maDocGia, maSach } = payload;
    await this._assertReaderAndBook(maDocGia, maSach);

    // 1. Kiểm tra đã mượn chưa (tránh trùng lặp trạng thái pending/borrowed cho cùng 1 cuốn)
    const existingBorrow = await this.Borrow.findOne({
      maDocGia: new ObjectId(maDocGia),
      maSach: new ObjectId(maSach),
      status: { $in: ["pending", "borrowed"] },
    });

    if (existingBorrow) {
      throw new Error("Bạn đã yêu cầu mượn sách này rồi.");
    }

    // 2. KIỂM TRA LỊCH SỬ TRẢ MUỘN (Yêu cầu của bạn)
    // Nếu độc giả đã từng trả muộn quá 3 lần -> Chặn mượn tiếp
    const lateReturnsCount = await this.Borrow.countDocuments({
      maDocGia: new ObjectId(maDocGia),
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

  // Lấy danh sách kèm thông tin chi tiết
  async findAll({ status, maDocGia } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (maDocGia) filter.maDocGia = new ObjectId(maDocGia);

    const pipeline = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      // Join bảng readers
      {
        $lookup: {
          from: "readers",
          localField: "maDocGia",
          foreignField: "_id",
          as: "reader",
        },
      },
      { $unwind: { path: "$reader", preserveNullAndEmptyArrays: true } },
      // Join bảng books
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
    return await this.Borrow.findOne({ _id: new ObjectId(id) });
  }

  // Duyệt (chỉ đổi trạng thái, chưa trừ sách)
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

  // Xác nhận đã mượn -> Trừ số lượng sách + Tính hạn trả
  async markBorrowed(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");

    if (!["approved", "pending"].includes(borrow.status)) {
      throw new Error("Invalid state transition to 'borrowed'");
    }

    // --- ĐÃ XÓA CHECK MAX BORROW TẠI ĐÂY THEO YÊU CẦU ---

    // Kiểm tra xem độc giả có cuốn nào ĐANG mượn mà bị quá hạn không?
    // (Nếu bạn không muốn chặn cái này thì có thể xóa luôn khối này)
    const now = new Date();
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

    // KIỂM TRA SỐ LƯỢNG SÁCH TRONG KHO (Yêu cầu của bạn)
    const book = await this.Book.findOne({ _id: borrow.maSach });
    if (!book) throw new Error("Book not found");
    if (!book.copies || book.copies <= 0) {
      throw new Error("Sách này đã hết, không thể cho mượn.");
    }

    // Trừ số lượng sách trong kho
    await this.Book.updateOne(
      { _id: borrow.maSach, copies: { $gt: 0 } },
      { $inc: { copies: -1 } }
    );

    // Tính hạn trả (25 ngày)
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

  // Xác nhận đã trả -> Cộng lại số lượng sách
  async markReturned(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");
    if (borrow.status !== "borrowed") {
      throw new Error("Only 'borrowed' can be returned");
    }

    // Cộng lại số lượng sách vào kho
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

  // Xóa phiếu mượn
  async delete(id) {
    const result = await this.Borrow.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result;
  }
}

module.exports = BorrowService;
