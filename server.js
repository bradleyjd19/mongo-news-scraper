const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const logger = require("morgan");
const axios = require("axios");
const cheerio = require("cheerio");

// const db = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/broArticles", { useNewUrlParser: true });

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/scrape", (req, res) => {
  axios.get("https://www.brobible.com")
    .then((response) => {
      const $ = cheerio.load(response.data);
      $(".block").each((i, element) => {
        let result = [];
        result.title = $(this)
          .find("h2").find("a").text();
        result.link = $(this)
          .find("a").attr("href");
        result.photo = $(this)
          .find("div").find("a").attr("href");
        db.Article.create(result)
          .then((dbArticle) => {
            console.log(dbArticle);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
  res.send("Scrape Complete");
});

app.listen(PORT, () => {
  console.log("Server listening on http://localhost: " + PORT);
});