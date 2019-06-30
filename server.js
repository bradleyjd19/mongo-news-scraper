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
  // First, we grab the body of the html with axios
  axios.get("http://www.brobible.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".block h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});


// app.get("/scrape", function(req, res) {
//   axios.get("https://www.brobible.com")
//     .then(function(response) {
//       const $ = cheerio.load(response.data);

//       $(".block").each(function(i, element) {
//         let result = [];
//         result.title = $(this)
//           .find("h2").find("a").text();
//         result.link = $(this)
//           .find("a").attr("href");
//         console.log(result);

//         db.Article.create(result)
//           .then(function(dbArticle) {
//             console.log(dbArticle);
//           })
//           .catch(function(err) {
//             console.log(err);
//           });
//       });
//     });
//   res.send("Scrape Complete");
// });

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