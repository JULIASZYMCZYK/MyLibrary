import { useEffect, useState } from "react";
import Formularz from "../../components/library/Formularz";
import ListaKsiazek from "../../components/library/ListaKsiazek";
import styles from "./styles.module.css";
import "bootstrap/dist/css/bootstrap.css";

const Main = () => {
  // lista książek z backendu
  const [ksiazki, ustawKsiazki] = useState([]);

  // co ma się wyświetlać: tabela albo formularz
  const [widok, setWidok] = useState("biblioteka"); // "biblioteka" | "formularz"

  // krótkie komunikaty dla użytkownika
  const [komunikat, setKomunikat] = useState("");

  // książka, która jest aktualnie edytowana (albo null)
  const [edytowanaKsiazka, setEdytowanaKsiazka] = useState(null);

  // pobranie książek (wymaga tokena)
  const pobierzKsiazki = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Brak tokena w localStorage — nie pobiorę książek.");
      return;
    }

    try {
      const res = await fetch("/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // obsługa błędów i np. wylogowanie przy 401
      if (!res.ok) {
        const text = await res.text();
        console.error("Nie udało się pobrać książek:", res.status, text);

        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location = "/login";
        }
        return;
      }

      const data = await res.json();
      ustawKsiazki(data);
    } catch (e) {
      console.error("Błąd sieci przy pobieraniu książek:", e);
    }
  };

  // startowo: pobranie listy
  useEffect(() => {
    pobierzKsiazki();
  }, []);

  // po dodaniu: odśwież listę + komunikat + powrót do biblioteki
  const dodajKsiazke = async () => {
    await pobierzKsiazki();
    setKomunikat("Książka dodana do twojej biblioteki ✅");
    setWidok("biblioteka");
    setTimeout(() => setKomunikat(""), 2500);
  };

  // usuwanie po id (z potwierdzeniem)
  const usunKsiazke = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Na pewno usunąć tę książkę?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 204 = usunięto bez treści odpowiedzi
      if (res.status === 204) {
        await pobierzKsiazki();
        setKomunikat("Usunięto książkę 🗑️");
        setTimeout(() => setKomunikat(""), 2500);
        return;
      }

      // jeśli backend zwróci błąd w JSON
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Błąd usuwania");
    } catch (e) {
      alert("Błąd sieci przy usuwaniu");
    }
  };

  // zapis edycji (PUT)
  const zapiszEdycjeKsiazki = async (id, payload) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await pobierzKsiazki();
        setEdytowanaKsiazka(null);
        setKomunikat("Zapisano zmiany ✅");
        setWidok("biblioteka");
        setTimeout(() => setKomunikat(""), 2500);
        return;
      }

      const err = await res.json().catch(() => ({}));
      alert(err.message || "Błąd edycji");
    } catch {
      alert("Błąd sieci przy edycji");
    }
  };

  // wejście w tryb edycji
  const edytujKsiazke = (book) => {
    setEdytowanaKsiazka(book);
    setWidok("formularz");
    setKomunikat("Edytujesz książkę ✏️");
    setTimeout(() => setKomunikat(""), 2000);
  };

  // wyjście z edycji i powrót do listy
  const anulujEdycje = () => {
    setEdytowanaKsiazka(null);
    setWidok("biblioteka");
  };

  // proste wylogowanie (kasuje token)
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location = "/login";
  };

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1>MySite</h1>
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <section className="container-fluid px-5 mt-4">
        {/* tytuł zależny od widoku */}
        <h1
          className="text-center mb-5 fw-bold"
          style={{ fontSize: "4rem", marginTop: "20px" }}
        >
          {widok === "formularz" ? "UZUPEŁNIANIE BIBLIOTEKI" : "BIBLIOTEKA"}
        </h1>

        {/* przyciski do przełączania widoku */}
        <div className="text-center mb-5">
          <button
            className="btn btn-outline-primary me-4"
            style={{
              fontSize: "2rem",
              padding: "20px 40px",
              borderWidth: "3px",
              fontWeight: "bold",
            }}
            onClick={() => {
              // nowa książka = brak edytowanej
              setEdytowanaKsiazka(null);
              setWidok("formularz");
            }}
          >
            Dodaj książkę
          </button>

          <button
            className="btn btn-outline-secondary"
            style={{
              fontSize: "2rem",
              padding: "20px 40px",
              borderWidth: "3px",
              fontWeight: "bold",
            }}
            onClick={() => setWidok("biblioteka")}
          >
            Moje książki ({ksiazki.length})
          </button>
        </div>

        {/* komunikat (jeśli jest) */}
        {komunikat && (
          <div className="alert alert-success text-center">{komunikat}</div>
        )}

        {/* formularz: dodawanie / edycja */}
        {widok === "formularz" && (
          <Formularz
            dodajKsiazke={dodajKsiazke}
            edytowanaKsiazka={edytowanaKsiazka}
            zapiszEdycjeKsiazki={zapiszEdycjeKsiazki}
            anulujEdycje={anulujEdycje}
          />
        )}

        {/* lista książek */}
        {widok === "biblioteka" && (
          <ListaKsiazek
            biblioteka={ksiazki}
            onDelete={usunKsiazke}
            onEdit={edytujKsiazke}
          />
        )}
      </section>
    </div>
  );
};

export default Main;
