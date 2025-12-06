// app/services/stats.service.js
class StatsService {
  constructor(client) {
    this.db = client.db();
    this.Book = this.db.collection("books");
    this.Reader = this.db.collection("readers");
    this.Borrow = this.db.collection("borrows");
  }

  async getOverview() {
    const [
      totalBooks,
      totalReaders,
      totalBorrows,
      pendingBorrows,
      borrowedBorrows,
      returnedBorrows,
    ] = await Promise.all([
      this.Book.countDocuments({}),
      this.Reader.countDocuments({}),
      this.Borrow.countDocuments({}),
      this.Borrow.countDocuments({ status: "pending" }),
      this.Borrow.countDocuments({ status: "borrowed" }),
      this.Borrow.countDocuments({ status: "returned" }),
    ]);

    return {
      totalBooks,
      totalReaders,
      totalBorrows,
      pendingBorrows,
      borrowedBorrows,
      returnedBorrows,
    };
  }
}

module.exports = StatsService;
