const router = require("express").Router();
const Book = require("../models/book");
const auth = require("../middleware/auth");

// pobranie listy książek zalogowanego użytkownika
router.get("/", auth, async (req, res) => {
  try {
    // id użytkownika z tokena
    const userId = req.user._id;

    // tylko książki tego użytkownika, od najnowszych
    const books = await Book.find({ userId }).sort({ createdAt: -1 });

    res.status(200).send(books);
  } catch (e) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// wybór tylko dozwolonych pól z body
const pickBookPayload = (body = {}) => ({
  title: body.title,
  author: body.author,
  genres: body.genres,
  tropes: body.tropes,
  status: body.status,
  comment: body.comment,
  rating: body.rating,
});

// sprawdzenie, czy wartość jest niepustym stringiem
const isNonEmptyString = (v) =>
  typeof v === "string" && v.trim().length > 0;

// podstawowa walidacja danych książki
const validateBookPayload = (p) => {
  if (!isNonEmptyString(p.title)) return "Tytuł jest wymagany";
  if (!isNonEmptyString(p.author)) return "Autor jest wymagany";

  if (p.title.trim().length > 100)
    return "Tytuł nie może mieć więcej niż 100 znaków";
  if (p.author.trim().length > 100)
    return "Autor nie może mieć więcej niż 100 znaków";

  // autor: tylko litery, spacje i kilka znaków specjalnych
  if (!/^[\p{L}\s.'-]+$/u.test(p.author.trim()))
    return "Autor może zawierać tylko litery i spacje";

  // gatunki i motywy muszą być tablicami
  if (p.genres !== undefined && !Array.isArray(p.genres))
    return "Gatunki muszą być tablicą";
  if (p.tropes !== undefined && !Array.isArray(p.tropes))
    return "Motywy muszą być tablicą";

  // limity wyboru
  if (Array.isArray(p.genres) && p.genres.length > 5)
    return "Możesz wybrać maksymalnie 5 gatunków";
  if (Array.isArray(p.tropes) && p.tropes.length > 5)
    return "Możesz wybrać maksymalnie 5 motywów";

  // ocena w skali 0–6
  if (p.rating !== undefined) {
    const r = Number(p.rating);
    if (!Number.isFinite(r) || r < 0 || r > 6)
      return "Ocena musi być liczbą 0-6";
  }

  return null;
};

// dodanie nowej książki
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // wyciągnięcie i sprawdzenie danych
    const payload = pickBookPayload(req.body);
    const err = validateBookPayload(payload);
    if (err) return res.status(400).send({ message: err });

    // zapis książki z przypisanym użytkownikiem
    const book = await new Book({
      ...payload,
      userId,
    }).save();

    res.status(201).send(book);
  } catch (e) {
    console.error("Błąd dodawania książki:", e);
    res.status(400).send({
      message: "Nie udało się dodać książki",
      details: e.message,
      errors: e.errors,
    });
  }
});

// edycja istniejącej książki
router.put("/:id", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // walidacja danych
    const payload = pickBookPayload(req.body);
    const err = validateBookPayload(payload);
    if (err) return res.status(400).send({ message: err });

    // aktualizacja tylko książki należącej do użytkownika
    const updated = await Book.findOneAndUpdate(
      { _id: id, userId },
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).send({ message: "Nie znaleziono książki" });

    res.status(200).send(updated);
  } catch (e) {
    res
      .status(400)
      .send({ message: "Nie udało się zaktualizować książki" });
  }
});

// usunięcie książki
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // usuwanie tylko książki danego użytkownika
    const deleted = await Book.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).send({ message: "Nie znaleziono książki" });
    }

    // poprawne usunięcie (bez treści odpowiedzi)
    res.status(204).send();
  } catch (e) {
    res.status(500).send({ message: "Nie udało się usunąć książki" });
  }
});

module.exports = router;
