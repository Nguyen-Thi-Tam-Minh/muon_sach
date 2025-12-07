const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("borrows");
    this.Book = client.db().collection("books");
    this.Reader = client.db().collection("readers");
  }

  extractBorrowData(payload) {
    const doc = {
      maDocGia: payload.maDocGia ? parseInt(payload.maDocGia) : undefined,
      maSach: payload.maSach ? parseInt(payload.maSach) : undefined,
      msnv: payload.msnv ? parseInt(payload.msnv) : undefined,
      status: payload.status,
      ngayMuon: payload.ngayMuon ? new Date(payload.ngayMuon) : undefined,
      ngayTra: payload.ngayTra ? new Date(payload.ngayTra) : undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      lateReturn: payload.lateReturn || false,
    };
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
  }

  async _assertReaderAndBook(maDocGia, maSach) {
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

    // 1. Kiểm tra sách đang mượn
    const existingBorrow = await this.Borrow.findOne({
      maDocGia: parseInt(maDocGia),
      maSach: parseInt(maSach),
      status: { $in: ["pending", "borrowed"] },
    });

    if (existingBorrow) {
      throw new Error("Bạn đã yêu cầu mượn sách này rồi.");
    }

    // 2. Chặn nếu vi phạm quá 3 lần
    const now = new Date();
    const lateCount = await this.Borrow.countDocuments({
      maDocGia: parseInt(maDocGia),
      $or: [
        { lateReturn: true },
        { status: "borrowed", dueDate: { $lt: now } },
      ],
    });

    if (lateCount > 3) {
      throw new Error(
        `Tài khoản bị khóa mượn do có ${lateCount} lần vi phạm (Trả trễ hoặc đang giữ sách quá hạn).`
      );
    }

    const doc = {
      ...this.extractBorrowData(payload),
      status: "pending",
      ngayMuon: null,
      ngayTra: null,
      dueDate: null,
      lateReturn: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.Borrow.insertOne(doc);
    return await this.findById(result.insertedId);
  }

  async findAll({ status, maDocGia } = {}) {
    const filter = {};
    if (status) filter.status = status;
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
    return await this.Borrow.findOne({ _id: new ObjectId(id) });
  }

  async approve(id, { msnv }) {
    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id), status: "pending" },
      {
        $set: {
          status: "approved",
          msnv: msnv ? parseInt(msnv) : null,
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
    const hasOverdue = await this.Borrow.findOne({
      maDocGia: borrow.maDocGia,
      status: "borrowed",
      dueDate: { $lt: now },
    });
    if (hasOverdue) {
      throw new Error(
        "Độc giả đang giữ sách quá hạn chưa trả, không thể duyệt phiếu mới."
      );
    }

    const book = await this.Book.findOne({ _id: borrow.maSach });
    if (!book) throw new Error("Book not found");
    if (!book.copies || book.copies <= 0) {
      throw new Error("Sách này đã hết, không thể cho mượn.");
    }

    await this.Book.updateOne(
      { _id: borrow.maSach, copies: { $gt: 0 } },
      { $inc: { copies: -1 } }
    );

    const dueDays = 14;
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000);

    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "borrowed",
          ngayMuon: now,
          dueDate,
          lateReturn: false,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );
    return result;
  }

  // --- HÀM TRẢ SÁCH VỚI LOGIC "LÀM GIẢ NGÀY TRẢ" ---
  async markReturned(id) {
    const borrow = await this.findById(id);
    if (!borrow) throw new Error("Borrow not found");
    if (borrow.status !== "borrowed") {
      throw new Error("Only 'borrowed' can be returned");
    }

    await this.Book.updateOne({ _id: borrow.maSach }, { $inc: { copies: 1 } });

    const now = new Date();
    let finalReturnDate = now; // Mặc định là ngày hiện tại

    // 1. Xác định xem có bị TRỄ hay không
    let isLate = false;

    // - Check trễ thực tế (Ngày hiện tại > Hạn trả)
    if (borrow.dueDate && now.getTime() > new Date(borrow.dueDate).getTime()) {
      isLate = true;
    }
    // - Check trễ do set tay trong DB (Test case)
    if (borrow.lateReturn === true) {
      isLate = true;
    }

    // 2. NẾU LÀ TRỄ => Đảm bảo Ngày Trả (finalReturnDate) phải lớn hơn Hạn Trả (dueDate)
    if (isLate && borrow.dueDate) {
      const dueDateObj = new Date(borrow.dueDate);

      // Nếu ngày trả hiện tại (now) lại nhỏ hơn hoặc bằng hạn trả (Vô lý về mặt logic hiển thị)
      // Thì ta set ngày trả = Hạn trả + 1 ngày
      if (finalReturnDate.getTime() <= dueDateObj.getTime()) {
        const fakeDate = new Date(dueDateObj);
        fakeDate.setDate(fakeDate.getDate() + 1); // Cộng thêm 1 ngày
        finalReturnDate = fakeDate;
      }
    }

    const result = await this.Borrow.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "returned",
          ngayTra: finalReturnDate, // Lưu ngày trả (có thể là ngày giả)
          lateReturn: isLate,
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
