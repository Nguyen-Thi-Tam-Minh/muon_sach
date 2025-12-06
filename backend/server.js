const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const UserService = require("./app/services/user.service");

async function startServer() {
    try {
        // Kết nối DB và lưu client
        const client = await MongoDB.connect(config.db.uri);
        console.log("Connected to the database!");

        // tạo admin mặc định nếu chưa có
        const userService = new UserService(client);
        await userService.ensureDefaultAdmin();

        // start server
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error("Cannot connect to the database!", error);
        process.exit(1);
    }
}
startServer();