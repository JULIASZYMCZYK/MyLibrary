require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");

const app = express();

// middleware
app.use(express.json()); // obsługa JSON w requestach
app.use(cors()); // pozwala na zapytania z frontendu

// połączenie z bazą danych
connection();

// podpięcie tras
app.use("/api/users", userRoutes);   // rejestracja użytkowników
app.use("/api/auth", authRoutes);    // logowanie
app.use("/api/books", booksRoutes);  // operacje na książkach

// uruchomienie serwera
const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`Nasłuchiwanie na porcie ${port}`)
);
