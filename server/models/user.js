const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// schemat użytkownika w bazie
const userSchema = new mongoose.Schema({
  // imię
  firstName: { type: String, required: true },

  // nazwisko
  lastName: { type: String, required: true },

  // email użytkownika
  email: { type: String, required: true },

  // hasło (hash zapisywany osobno)
  password: { type: String, required: true },
});

// generowanie tokena JWT dla użytkownika
userSchema.methods.generateAuthToken = function () {
  // w tokenie zapisywane jest id użytkownika
  const token = jwt.sign(
    { _id: this._id },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" } // token ważny 7 dni
  );

  return token;
};

// model użytkownika
const User = mongoose.model("User", userSchema);

// walidacja danych przy rejestracji
const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  });

  return schema.validate(data);
};

module.exports = { User, validate };
