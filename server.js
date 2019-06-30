const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const logger = require("morgan");
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models/index.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/broarticles", { useNewUrlParser: true });

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

app.get("/saved", (req, res) => {
  db.Article.find({ saved: true })
    .populate("notes")
    .then((error, data) => {
      let hbsObject = {
        article: data
      };
      res.render("index", hbsObject);
    });
});

app.get("/scrape", function(req, res) {
  axios.get("http://www.brobible.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".block h2").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.photo = $(this)
        .parent("div")
        .children(".post-photo")
        .children("a")
        .children("img")
        .attr("src");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
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