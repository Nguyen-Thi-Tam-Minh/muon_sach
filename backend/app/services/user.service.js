const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const MongoDB = require("../utils/mongodb.util");

class UserService {
  constructor(client) {
    this.db = client.db();
    this.User = this.db.collection("users");
    this.Reader = this.db.collection("readers");
    this.Staff = this.db.collection("staffs");
  }

  extract(data) {
    const doc = {
      username: data.username,
      password: data.password,
      role: data.role || "user",
      // readerId và staffId là số nguyên
      readerId: data.readerId ? parseInt(data.readerId) : undefined,
      staffId: data.staffId ? parseInt(data.staffId) : undefined,
    };
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
  }

  async register(data) {
    const doc = this.extract(data);

    const exists = await this.User.findOne({ username: doc.username });
    if (exists) throw new Error("Username already exists");

    let readerId = doc.readerId;
    let staffId = doc.staffId;

    if (doc.role === "user") {
      // --- TẠO READER (MADOCGIA) ID SỐ TỪ 30000 ---
      if (!readerId) {
        const generatedId = await MongoDB.generateId("readers", 30000);
        const readerDoc = {
          _id: generatedId, // MADOCGIA
          hoLot: data.hoLot || "",
          ten: data.ten || doc.username,
          phai: data.phai || "",
          diaChi: data.diaChi || "",
          dienThoai: data.dienThoai || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await this.Reader.insertOne(readerDoc);
        readerId = generatedId;
      }
    } else if (["admin", "nhanvien"].includes(doc.role)) {
      // --- TẠO STAFF (MASNV) ID SỐ TỪ 50000 ---
      if (!staffId) {
        const generatedId = await MongoDB.generateId("staffs", 50000);
        const staffDoc = {
          _id: generatedId, // MASNV
          msnv: doc.username, // Vẫn giữ username làm mã định danh text
          hoTenNV: data.hoTen || data.ten || doc.username,
          chucVu: doc.role,
          diaChi: data.diaChi || "",
          soDienThoai: data.dienThoai || data.soDienThoai || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await this.Staff.insertOne(staffDoc);
        staffId = generatedId;
      }
    }

    const hashed = await bcrypt.hash(doc.password, 10);
    const insertData = {
      username: doc.username,
      password: hashed,
      role: doc.role,
    };

    if (readerId) insertData.readerId = readerId;
    if (staffId) insertData.staffId = staffId;

    const result = await this.User.insertOne(insertData);
    return await this.User.findOne({ _id: result.insertedId });
  }

  async login(username, password) {
    const user = await this.User.findOne({ username });
    if (!user) throw new Error("Invalid username or password");
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid username or password");
    return user;
  }

  async findById(id) {
    return await this.User.findOne({ _id: new ObjectId(id) });
  }

  async findAll() {
    // Sử dụng aggregate để nối bảng (Join)
    return await this.User.aggregate([
      // 1. Nối với bảng readers dựa trên readerId
      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "readerInfo",
        },
      },
      // 2. Nối với bảng staffs dựa trên staffId
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffInfo",
        },
      },
      // 3. Giải nén mảng kết quả (unwind)
      { $unwind: { path: "$readerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$staffInfo", preserveNullAndEmptyArrays: true } },

      // 4. Tạo các trường hiển thị chung (diaChi, dienThoai)
      {
        $addFields: {
          // Lấy địa chỉ từ Reader hoặc Staff
          diaChi: { $ifNull: ["$readerInfo.diaChi", "$staffInfo.diaChi"] },
          // Lấy SĐT (Reader dùng 'dienThoai', Staff dùng 'soDienThoai')
          dienThoai: {
            $ifNull: ["$readerInfo.dienThoai", "$staffInfo.soDienThoai"],
          },
        },
      },
      // 5. Loại bỏ các trường không cần thiết (để gọn dữ liệu trả về)
      {
        $project: {
          readerInfo: 0,
          staffInfo: 0,
          password: 0,
        },
      },
    ]).toArray();
  }

  async update(id, data) {
    const update = {};
    if (data.username) update.username = data.username;
    if (data.role) update.role = data.role;
    if (data.password) {
      update.password = await bcrypt.hash(data.password, 10);
    }
    // Update link ID (số nguyên)
    if (data.readerId) update.readerId = parseInt(data.readerId);
    if (data.staffId) update.staffId = parseInt(data.staffId);

    const result = await this.User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    // Logic xóa user, có thể xóa luôn reader/staff nếu muốn
    const result = await this.User.findOneAndDelete({ _id: new ObjectId(id) });
    return result;
  }

  async ensureDefaultAdmin() {
    const count = await this.User.countDocuments({ role: "admin" });
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    // Tạo staff cho admin mặc định (ID số)
    const generatedId = await MongoDB.generateId("staffs", 50000);
    const staffDoc = {
      _id: generatedId,
      msnv: username,
      hoTenNV: "Administrator",
      chucVu: "admin",
      diaChi: "System",
      soDienThoai: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.Staff.insertOne(staffDoc);

    const hashed = await bcrypt.hash(password, 10);
    await this.User.insertOne({
      username,
      password: hashed,
      role: "admin",
      staffId: generatedId,
    });

    console.log(
      `\n[INIT] Default admin created: ${username} / ${password} (MASNV: ${generatedId})\n`
    );
  }
}

module.exports = UserService;
