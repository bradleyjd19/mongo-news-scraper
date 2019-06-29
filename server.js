const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const logger = require("morgan");
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/broArticles", { useNewUrlParser: true });

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  db.Article.find({ saved: false }, (error, data) => {
    let hbsObject = {
      article: data
    };
    res.render("index", hbsObject);
  });
});

app.get("/scrape", (req, res) => {
  axios.get("https://www.brobible.com")
    .then((response) => {
      const $ = cheerio.load(response.data);
      $(".block").each((i, element) => {
        let result = [];
        result.title = $(element)
          .find("h2").find("a").text();
        result.link = $(element)
          .find("a").attr("href");
        result.photo = $(element)
          .find("div").find("a").attr("href");
        console.log(result);
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

app.get("/articles", (req, res) => {
  db.Article.find({})
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/articles/:id", (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then((dbArticle) => {
      res.json(dbArticle)
    })
    .catch((err) => {
      res.json(err);
    });
});

app.post("/articles/:id", (req, res) => {
  db.Note.create(req.body)
    .then((dbNote) => {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.listen(PORT, () => {
  console.log("Server listening on http://localhost: " + PORT);
});