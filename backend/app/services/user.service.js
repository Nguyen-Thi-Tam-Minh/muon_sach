const { ObjectId } = require("mongodb");
// const bcrypt = require("bcryptjs"); // Tắt mã hóa
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

    const password = doc.password;

    let readerId = doc.readerId;
    let staffId = doc.staffId;

    if (doc.role === "user") {
      // --- TẠO READER (ĐỘC GIẢ) ---
      if (!readerId) {
        const generatedId = await MongoDB.generateId("readers", 30000);
        const readerDoc = {
          _id: generatedId,
          password: password,
          hoLot: data.hoLot || "",
          ten: data.ten || doc.username,
          ngaySinh: data.ngaySinh ? new Date(data.ngaySinh) : null,
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
      // --- TẠO STAFF ---
      if (!staffId) {
        // Sinh ID số bắt đầu từ 50000
        const generatedId = await MongoDB.generateId("staffs", 50000);

        const staffDoc = {
          _id: generatedId,

          // SỬA: MSNV lấy theo ID số vừa sinh (50000, 50001...)
          // Thay vì lấy doc.username như trước
          msnv: generatedId,

          password: password,
          hoTenNV: data.hoTen || "",
          chucVu:
            data.chucVu ||
            (doc.role === "admin" ? "Quản trị viên" : "Nhân viên"),
          diaChi: data.diaChi || "",
          soDienThoai: data.dienThoai || data.soDienThoai || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.Staff.insertOne(staffDoc);
        staffId = generatedId;
      }
    }

    // --- TẠO USER ---
    const insertData = {
      username: doc.username,
      password: password,
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

    const match = password === user.password;

    if (!match) throw new Error("Invalid username or password");
    return user;
  }

  async findById(id) {
    return await this.User.findOne({ _id: new ObjectId(id) });
  }

  async findAll() {
    return await this.User.aggregate([
      {
        $lookup: {
          from: "readers",
          localField: "readerId",
          foreignField: "_id",
          as: "readerInfo",
        },
      },
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffInfo",
        },
      },
      { $unwind: { path: "$readerInfo", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$staffInfo", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          diaChi: { $ifNull: ["$readerInfo.diaChi", "$staffInfo.diaChi"] },
          dienThoai: {
            $ifNull: ["$readerInfo.dienThoai", "$staffInfo.soDienThoai"],
          },
          hoTenHienThi: {
            $ifNull: [
              "$staffInfo.hoTenNV",
              {
                $concat: [
                  { $ifNull: ["$readerInfo.hoLot", ""] },
                  " ",
                  { $ifNull: ["$readerInfo.ten", ""] },
                ],
              },
            ],
          },
          chucVu: "$staffInfo.chucVu",
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]).toArray();
  }

  async update(id, data) {
    const update = {};
    const password = data.password;

    if (data.username) update.username = data.username;
    if (data.role) update.role = data.role;
    if (password) update.password = password;

    const user = await this.User.findOne({ _id: new ObjectId(id) });

    if (user) {
      if (user.staffId) {
        const staffUpdate = {};
        if (data.hoTen !== undefined) staffUpdate.hoTenNV = data.hoTen;
        if (data.chucVu !== undefined) staffUpdate.chucVu = data.chucVu;
        if (data.diaChi !== undefined) staffUpdate.diaChi = data.diaChi;
        if (data.dienThoai !== undefined)
          staffUpdate.soDienThoai = data.dienThoai;
        if (password) staffUpdate.password = password;

        if (Object.keys(staffUpdate).length > 0) {
          await this.Staff.updateOne(
            { _id: user.staffId },
            { $set: staffUpdate }
          );
        }
      }

      if (user.readerId) {
        const readerUpdate = {};
        if (data.hoLot !== undefined) readerUpdate.hoLot = data.hoLot;
        if (data.ten !== undefined) readerUpdate.ten = data.ten;
        if (data.ngaySinh !== undefined)
          readerUpdate.ngaySinh = new Date(data.ngaySinh);
        if (data.phai !== undefined) readerUpdate.phai = data.phai;
        if (data.diaChi !== undefined) readerUpdate.diaChi = data.diaChi;
        if (data.dienThoai !== undefined)
          readerUpdate.dienThoai = data.dienThoai;
        if (password) readerUpdate.password = password;

        if (Object.keys(readerUpdate).length > 0) {
          await this.Reader.updateOne(
            { _id: user.readerId },
            { $set: readerUpdate }
          );
        }
      }
    }

    const result = await this.User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const user = await this.User.findOne({ _id: new ObjectId(id) });
    if (user) {
      if (user.readerId) await this.Reader.deleteOne({ _id: user.readerId });
      if (user.staffId) await this.Staff.deleteOne({ _id: user.staffId });
    }
    const result = await this.User.findOneAndDelete({ _id: new ObjectId(id) });
    return result;
  }

  async ensureDefaultAdmin() {
    const count = await this.User.countDocuments({ role: "admin" });
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    // Sinh ID số cho admin
    const generatedId = await MongoDB.generateId("staffs", 50000);

    const staffDoc = {
      _id: generatedId,

      // SỬA: MSNV của admin mặc định cũng là số (50000)
      msnv: generatedId,

      password: password,
      hoTenNV: "Administrator",
      chucVu: "Quản trị viên",
      diaChi: "System",
      soDienThoai: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.Staff.insertOne(staffDoc);

    await this.User.insertOne({
      username,
      password: password,
      role: "admin",
      staffId: generatedId,
    });

    console.log(
      `\n[INIT] Default admin created: ${username} / ${password} (MASNV: ${generatedId})\n`
    );
  }
}

module.exports = UserService;
