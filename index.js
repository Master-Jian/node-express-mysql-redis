const express = require("express");
const app = express();

const IndexRouter = require("./router/index");

// 引入静态资源
app.use(express.static("public"));

// 配置post解析
app.use(express.urlencoded({ extended: false })); // 支持form表单格式
app.use(express.json()); // 支持json格式

app.use("/api", IndexRouter);

app.listen(9999, () => {
  console.log("listening on");
});
