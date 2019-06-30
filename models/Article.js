const mongoose = require("mongoose");
const Note = require("./Note");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  saved: {
    type: Boolean,
    default: false
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }

});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;