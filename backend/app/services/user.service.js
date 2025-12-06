const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class UserService {
  constructor(client) {
    this.db = client.db();
    this.User = this.db.collection("users");
    this.Reader = this.db.collection("readers");
  }

  extract(data) {
    const doc = {
      username: data.username,
      password: data.password,
      role: data.role || "user", // "user" | "admin"
      readerId: data.readerId ? new ObjectId(data.readerId) : undefined,
    };
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return doc;
  }

  async register(data) {
    const doc = this.extract(data);
    const exists = await this.User.findOne({ username: doc.username });
    if (exists) throw new Error("Username already exists");

    // Tạo Reader nếu chưa được truyền readerId
    let readerId = doc.readerId;
    if (!readerId && doc.role === "user") {
      const readerDoc = {
        hoLot: data.hoLot || "",
        ten: data.ten || doc.username,
        phai: data.phai || "",
        diaChi: data.diaChi || "",
        dienThoai: data.dienThoai || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const r = await this.Reader.insertOne(readerDoc);
      readerId = r.insertedId;
    }

    const hashed = await bcrypt.hash(doc.password, 10);
    const insertData = {
      username: doc.username,
      password: hashed,
      role: doc.role,
    };

    if (readerId) insertData.readerId = readerId;

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
    return await this.User.find({}).toArray();
  }

  async update(id, data) {
    const update = {};
    if (data.username) update.username = data.username;
    if (data.role) update.role = data.role;
    if (data.password) {
      update.password = await bcrypt.hash(data.password, 10);
    }
    if (data.readerId) {
      update.readerId = new ObjectId(data.readerId);
    }
    const result = await this.User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.User.findOneAndDelete({ _id: new ObjectId(id) });
    return result;
  }

  // tạo admin mặc định nếu chưa có
  async ensureDefaultAdmin() {
    const count = await this.User.countDocuments({ role: "admin" });
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const hashed = await bcrypt.hash(password, 10);
    await this.User.insertOne({
      username,
      password: hashed,
      role: "admin",
      // admin không cần readerId
    });

    console.log(
      `\n[INIT] Default admin created: ${username} / ${password}\n` +
      `-> Hãy đổi mật khẩu sau khi đăng nhập!`
    );
  }
}

module.exports = UserService;
