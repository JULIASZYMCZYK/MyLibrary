const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");

// logowanie użytkownika
router.post("/", async (req, res) => {
  try {
    // walidacja danych z formularza
    const { error } = validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({ message: error.details[0].message });
    }

    // sprawdzenie, czy użytkownik istnieje
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .send({ message: "Invalid Email or Password" });
    }

    // porównanie hasła z hashem w bazie
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res
        .status(401)
        .send({ message: "Invalid Email or Password" });
    }

    // wygenerowanie tokena JWT
    const token = user.generateAuthToken();

    // poprawne logowanie
    res
      .status(200)
      .send({ data: token, message: "logged in successfully" });

  } catch (error) {
    // błąd po stronie serwera
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// walidacja danych logowania
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });

  return schema.validate(data);
};

module.exports = router;
