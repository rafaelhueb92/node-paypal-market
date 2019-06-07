const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", require("./routes"));
const port = 3000;
app.listen(port, console.log(`Servidor rodando em localhost::${port}`));
