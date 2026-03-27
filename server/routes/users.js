const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

// rejestracja nowego użytkownika
router.post("/", async (req, res) => {
  try {
    // walidacja danych z formularza
    const { error } = validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ message: error.details[0].message });
    }

    // sprawdzenie, czy email już istnieje
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(409)
        .send({ message: "User with given email already Exist!" });
    }

    // wygenerowanie soli do hasła
    const salt = await bcrypt.genSalt(Number(process.env.SALT));

    // zahashowanie hasła
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // zapis użytkownika do bazy
    await new User({
      ...req.body,
      password: hashPassword,
    }).save();

    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    // błąd po stronie serwera
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
