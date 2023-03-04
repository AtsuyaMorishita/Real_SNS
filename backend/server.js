const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/upload");
const PORT = 5000;
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

//データベース(MongoDB)接続
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DBと接続中・・・");
  })
  .catch((err) => {
    console.log("DBとの接続に失敗しました。。", err);
  });

//ミドルウェア ルーティング設定
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);

// app.get("/", (req, res) => {
//   console.log("hello world");
// });

//サーバーの起動
app.listen(PORT, () => console.log("サーバーが起動しました！"));
