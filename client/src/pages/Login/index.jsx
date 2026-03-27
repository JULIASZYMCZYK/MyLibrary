import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

const Login = () => {
  // dane z formularza
  const [data, setData] = useState({ email: "", password: "" });

  // komunikat błędu z backendu
  const [error, setError] = useState("");

  // aktualizacja pola po name="email"/"password"
  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  // wysłanie logowania do API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = "http://localhost:3001/api/auth"; // endpoint logowania
      const { data: res } = await axios.post(url, data);

      // zapis tokena + przejście do strony głównej
      localStorage.setItem("token", res.data);
      window.location = "/";
    } catch (error) {
      // pokazanie błędu tylko dla odpowiedzi 4xx/5xx
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_form_container}>
        <div className={styles.left}>
          {/* formularz logowania */}
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Login to Your Account</h1>

            {/* email */}
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className={styles.input}
            />

            {/* hasło */}
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className={styles.input}
            />

            {/* błąd logowania */}
            {error && <div className={styles.error_msg}>{error}</div>}

            {/* przycisk submit */}
            <button type="submit" className={styles.green_btn}>
              Sign In
            </button>
          </form>
        </div>

        <div className={styles.right}>
          {/* przejście do rejestracji */}
          <h1>New Here ?</h1>
          <Link to="/signup">
            <button type="button" className={styles.white_btn}>
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
