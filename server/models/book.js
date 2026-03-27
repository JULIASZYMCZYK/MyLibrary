const mongoose = require("mongoose");

// regex dla autora: litery (unicode, także PL), spacje oraz . ' -
const AUTHOR_RE = /^[\p{L}\s.'-]+$/u;

const bookSchema = new mongoose.Schema(
  {
    // tytuł książki
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },

    // autor książki
    author: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      validate: {
        validator: (v) => AUTHOR_RE.test(v),
        message:
          "Autor może zawierać tylko litery (także polskie), spacje oraz . ' -",
      },
    },

    // lista gatunków (max 5)
    genres: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Możesz wybrać maksymalnie 5 gatunków",
      },
    },

    // lista motywów (max 5)
    tropes: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Możesz wybrać maksymalnie 5 motywów",
      },
    },

    // status czytania
    status: {
      type: String,
      enum: [
        "do przeczytania",
        "w trakcie czytania",
        "przeczytane",
        "porzucone",
      ],
      default: "w trakcie czytania",
    },

    // komentarz użytkownika
    comment: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    // ocena w skali 0–6
    rating: {
      type: Number,
      min: 0,
      max: 6,
      default: 0,
    },

    // właściciel książki
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Book", bookSchema);
