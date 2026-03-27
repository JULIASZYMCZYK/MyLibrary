const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  // pobranie nagłówka Authorization
  const header = req.headers.authorization || "";

  // wyciągnięcie tokena z "Bearer <token>"
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  // brak tokena = brak dostępu
  if (!token) {
    return res.status(401).send({ message: "Brak tokena" });
  }

  try {
    // sprawdzenie poprawności tokena
    // secret musi być ten sam co przy jego tworzeniu
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

    // zapis danych użytkownika do req
    req.user = decoded;

    // przejście do kolejnego middleware
    next();
  } catch (err) {
    // token jest błędny lub wygasł
    return res.status(401).send({ message: "Nieprawidłowy token" });
  }
};
