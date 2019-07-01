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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/broarticles";

mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", function (req, res) {
  db.Article.find({ saved: false }, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      let hbsObject = {
        article: data
      };
      res.render("index", hbsObject);
    }
  });
});

app.get("/saved", function (req, res) {
  db.Article.find({ saved: true }, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      let hbsObject = {
        article: data
      };
      res.render("index", hbsObject);
    }
  });
});

app.post("/saved/:id", function (req, res) {
  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } })
    .then(function (dbArticle) {
      res.json(dbArticle);
    });
});

app.get("/scrape", function (req, res) {
  axios.get("http://www.brobible.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $(".block h2").each(function (i, element) {
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
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle)
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("Server listening on http://localhost: " + PORT);
});