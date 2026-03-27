import { useEffect, useMemo, useState } from "react";
import "./Formularz.css";

const AUTHOR_REGEX = /^[\p{L}\s.'-]+$/u;
const AUTHOR_REGEX_PARTIAL = /^[\p{L}\s.'-]*$/u;

const MAX_GATUNKI = 5;
const MAX_MOTYWY = 5;

function Formularz({
  dodajKsiazke,
  edytowanaKsiazka,
  zapiszEdycjeKsiazki,
  anulujEdycje,
}) {
  // stan formularza
  const [tytul, ustawTytul] = useState("");
  const [autor, ustawAutor] = useState("");
  const [tematyka, ustawTematyka] = useState([]);
  const [motyw, ustawMotyw] = useState([]);
  const [status, ustawStatus] = useState("w trakcie czytania");
  const [komentarz, ustawKomentarz] = useState("");
  const [ocena, ustawOcene] = useState(0);

  // UI / walidacja
  const [submitted, setSubmitted] = useState(false);

  // custom motywy
  const [nowyMotyw, ustawNowyMotyw] = useState("");
  const [bladMotywu, ustawBladMotywu] = useState("");
  const [wlasneMotywy, ustawWlasneMotywy] = useState([]);

  const trybEdycji = Boolean(edytowanaKsiazka?._id);

  // wypełnienie formularza w trybie edycji
  useEffect(() => {
    if (!trybEdycji) return;

    ustawTytul(edytowanaKsiazka.title || "");
    ustawAutor(edytowanaKsiazka.author || "");
    ustawTematyka(edytowanaKsiazka.genres || []);
    ustawMotyw(edytowanaKsiazka.tropes || []);
    ustawStatus(edytowanaKsiazka.status || "w trakcie czytania");
    ustawKomentarz(edytowanaKsiazka.comment || "");
    ustawOcene(edytowanaKsiazka.rating ?? 0);

    // reset drobnych stanów UI
    setSubmitted(false);
    ustawNowyMotyw("");
    ustawBladMotywu("");
  }, [trybEdycji, edytowanaKsiazka]);

  // checkboxy: gatunki (limit)
  const zmienTematyke = (e) => {
    const wartosc = e.target.value;

    if (e.target.checked) {
      if (tematyka.length >= MAX_GATUNKI) return;
      ustawTematyka((prev) => [...prev, wartosc]);
    } else {
      ustawTematyka((prev) => prev.filter((t) => t !== wartosc));
    }
  };

  // checkboxy: motywy (limit)
  const zmienMotyw = (e) => {
    const wartosc = e.target.value;

    if (e.target.checked) {
      if (motyw.length >= MAX_MOTYWY) return;
      ustawMotyw((prev) => (prev.includes(wartosc) ? prev : [...prev, wartosc]));
    } else {
      ustawMotyw((prev) => prev.filter((m) => m !== wartosc));
    }
  };

  // systemowe kategorie motywów
  const motywyKategorie = useMemo(
    () => [
      {
        nazwa: "Romans",
        opcje: [
          "Enemies to lovers",
          "Friends to lovers",
          "Fake dating",
          "Slow burn",
          "Grumpy x sunshine",
          "Second chance romance",
          "Forbidden love",
          "One bed",
          "Marriage of convenience",
          "Love triangle",
        ],
      },
      {
        nazwa: "Kryminał / Thriller",
        opcje: [
          "Seryjny morderca",
          "Cold case",
          "Zagadka kryminalna",
          "Niewiarygodny narrator",
          "Psychologiczna gra",
          "Zamknięta przestrzeń (locked room)",
          "Tajemnica z przeszłości",
          "Sekrety małego miasteczka",
        ],
      },
      {
        nazwa: "Fantasy / Sci-Fi",
        opcje: [
          "Chosen one",
          "Found family",
          "Magic academy",
          "Przepowiednia",
          "Morally grey character",
          "Enemies to allies",
          "Ukryte moce",
          "Walka z systemem",
        ],
      },
      {
        nazwa: "Obyczajowe / Uniwersalne",
        opcje: [
          "Coming of age",
          "Trauma z przeszłości",
          "Redemption arc",
          "Sekretna tożsamość",
          "Plot twist",
          "Relacje rodzinne",
          "Zakazana prawda",
        ],
      },
    ],
    []
  );

  const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

  // lista wszystkich systemowych motywów (do porównań)
  const wszystkieSystemoweMotywy = useMemo(() => {
    return motywyKategorie.flatMap((k) => k.opcje).map(normalize);
  }, [motywyKategorie]);

  // custom motywy = te spoza listy systemowej (w trybie edycji)
  useEffect(() => {
    if (!trybEdycji) return;

    const custom = (edytowanaKsiazka?.tropes || []).filter(
      (m) => !wszystkieSystemoweMotywy.includes(normalize(m))
    );
    ustawWlasneMotywy(custom);
  }, [trybEdycji, edytowanaKsiazka, wszystkieSystemoweMotywy]);

  // dodanie własnego motywu (z walidacją i limitem)
  const dodajWlasnyMotyw = () => {
    if (motyw.length >= MAX_MOTYWY) {
      alert(`Możesz wybrać maksymalnie ${MAX_MOTYWY} motywów.`);
      return;
    }

    const cleaned = nowyMotyw.trim();
    const key = normalize(cleaned);

    if (cleaned === "") {
      ustawBladMotywu("Wpisz motyw.");
      return;
    }

    if (wszystkieSystemoweMotywy.includes(key)) {
      ustawBladMotywu("Ten motyw już istnieje na liście.");
      return;
    }

    const wybraneNormalized = motyw.map(normalize);
    if (wybraneNormalized.includes(key)) {
      ustawBladMotywu("Ten motyw jest już dodany/wybrany.");
      return;
    }

    const customNormalized = wlasneMotywy.map(normalize);
    if (customNormalized.includes(key)) {
      ustawBladMotywu("Ten motyw już istnieje w Twoich motywach.");
      return;
    }

    ustawWlasneMotywy((prev) =>
      prev.includes(cleaned) ? prev : [...prev, cleaned]
    );
    ustawMotyw((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]));

    ustawNowyMotyw("");
    ustawBladMotywu("");
  };

  // reset formularza
  const wyczyscFormularz = () => {
    ustawTytul("");
    ustawAutor("");
    ustawTematyka([]);
    ustawMotyw([]);
    ustawStatus("w trakcie czytania");
    ustawKomentarz("");
    setSubmitted(false);
    ustawNowyMotyw("");
    ustawBladMotywu("");
    ustawOcene(0);
    ustawWlasneMotywy([]);
  };

  // submit: walidacja + edycja albo POST
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (tytul.trim() === "" || autor.trim() === "") return;

    const payload = {
      title: tytul.trim(),
      author: autor.trim(),
      genres: tematyka,
      tropes: motyw,
      status,
      comment: komentarz,
      rating: ocena,
    };

    if (trybEdycji) {
      await zapiszEdycjeKsiazki(edytowanaKsiazka._id, payload);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text(); // debug
      console.log("POST /api/books status:", res.status, "body:", text);

      if (!res.ok) {
        alert(`Błąd dodawania: ${res.status}\n${text}`);
        return;
      }

      await dodajKsiazke();
      wyczyscFormularz();
    } catch (error) {
      console.error("Błąd sieci przy zapisie książki:", error);
    }
  };

  const gatunki = [
    "beletrystyka",
    "biografia",
    "biznes",
    "dla dzieci",
    "dramat",
    "esej",
    "fantasy",
    "filozofia",
    "historyczna",
    "horror",
    "kryminał",
    "literatura piękna",
    "młodzieżowa",
    "obyczajowa",
    "poezja",
    "popularnonaukowa",
    "przygodowa",
    "psychologia",
    "religia / duchowość",
    "reportaż",
    "romans",
    "science fiction",
    "sensacja",
    "thriller",
    "podróżnicza",
    "inne"
  ];



  return (
    <form onSubmit={handleSubmit} className="col-lg-8 offset-lg-2 p-5">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {trybEdycji ? (
          <div className="fw-semibold">
            Edycja: <span className="text-muted">{edytowanaKsiazka?.title}</span>
          </div>
        ) : (
          <div className="fw-semibold">Dodawanie książki</div>
        )}

        {trybEdycji && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              wyczyscFormularz();
              anulujEdycje();
            }}
          >
            Anuluj edycję
          </button>
        )}
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Tytuł</label>
        <input
          type="text"
          className="form-control"
          value={tytul}
          maxLength={100}
          onChange={(e) => ustawTytul(e.target.value)}
        />

        <small className="text-muted d-block">{tytul.length}/100</small>

        {submitted && tytul.trim() === "" && (
          <small className="text-danger">Uzupełnij tytuł</small>
        )}
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Autor</label>
        <input
          type="text"
          className="form-control"
          value={autor}
          maxLength={100}
          onChange={(e) => {
            const value = e.target.value;
            // wpis tylko zgodny z regexem (wersja "partial" do pisania)
            if (AUTHOR_REGEX_PARTIAL.test(value)) {
              ustawAutor(value);
            }
          }}
        />

        <small className="text-muted d-block">{autor.length}/100</small>

        {submitted && autor.trim() === "" && (
          <small className="text-danger">Uzupełnij autora</small>
        )}

        {submitted && autor.trim() !== "" && !AUTHOR_REGEX.test(autor.trim()) && (
          <small className="text-danger">
            Autor może zawierać tylko litery (także polskie) i spacje
          </small>
        )}
      </div>

      <div className="form-group mb-3">
        <label className="form-label d-flex justify-content-between align-items-center">
          <span>Gatunki</span>
          <small className="text-muted">Wybrane: {tematyka.length}</small>
        </label>

        <details>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>Rozwiń</summary>

          <div className="mt-2">
            {gatunki.map((gatunek) => (
              <div className="form-check mb-1" key={gatunek}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  value={gatunek}
                  onChange={zmienTematyke}
                  id={`gatunek-${gatunek}`}
                  checked={tematyka.includes(gatunek)}
                  disabled={
                    !tematyka.includes(gatunek) && tematyka.length >= MAX_GATUNKI
                  }
                />
                <label className="form-check-label" htmlFor={`gatunek-${gatunek}`}>
                  {gatunek}
                </label>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="form-group mb-3">
        <label className="form-label d-flex justify-content-between align-items-center">
          <span>Motywy (tropes)</span>
          <small className="text-muted">Wybrane: {motyw.length}</small>
        </label>

        {motywyKategorie.map((kat) => (
          <details key={kat.nazwa} className="mb-2">
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              {kat.nazwa}
            </summary>

            <div className="mt-2">
              {kat.opcje.map((opcja) => (
                <div className="form-check mb-1" key={`${kat.nazwa}-${opcja}`}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    value={opcja}
                    onChange={zmienMotyw}
                    id={`motyw-${kat.nazwa}-${opcja}`}
                    checked={motyw.includes(opcja)}
                    disabled={!motyw.includes(opcja) && motyw.length >= MAX_MOTYWY}
                  />

                  <label
                    className="form-check-label"
                    htmlFor={`motyw-${kat.nazwa}-${opcja}`}
                  >
                    {opcja}
                  </label>
                </div>
              ))}
            </div>
          </details>
        ))}

        {wlasneMotywy.length > 0 && (
          <div className="mt-3">
            <div className="fw-semibold mb-1">Twoje motywy</div>

            {wlasneMotywy.map((opcja) => (
              <div className="form-check mb-1" key={`custom-${opcja}`}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  value={opcja}
                  onChange={zmienMotyw}
                  checked={motyw.includes(opcja)}
                  id={`motyw-custom-${opcja}`}
                  disabled={!motyw.includes(opcja) && motyw.length >= MAX_MOTYWY}
                />

                <label
                  className="form-check-label"
                  htmlFor={`motyw-custom-${opcja}`}
                >
                  {opcja}
                </label>
              </div>
            ))}
          </div>
        )}

        <details className="mt-3">
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            Dodaj własny motyw
          </summary>

          <div className="mt-2">
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={nowyMotyw}
                onChange={(e) => {
                  ustawNowyMotyw(e.target.value);
                  if (bladMotywu) ustawBladMotywu("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    dodajWlasnyMotyw();
                  }
                }}
                placeholder="np. academia, heist, fake identity..."
              />
              <button
                type="button"
                className="btn btn-primary btn-lg px-4"
                style={{ fontSize: "1.4rem", fontWeight: "bold" }}
                onClick={dodajWlasnyMotyw}
              >
                Dodaj
              </button>
            </div>

            {bladMotywu && <small className="text-danger">{bladMotywu}</small>}
          </div>
        </details>
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Status czytania</label>
        <select
          name="status"
          className="form-control"
          value={status}
          onChange={(e) => ustawStatus(e.target.value)}
        >
          <option value="do przeczytania">Do przeczytania</option>
          <option value="w trakcie czytania">W trakcie czytania</option>
          <option value="przeczytane">Przeczytane</option>
          <option value="porzucone">Porzucone</option>
        </select>
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Własne przemyślenia</label>
        <textarea
          className="form-control"
          value={komentarz}
          onChange={(e) => ustawKomentarz(e.target.value)}
          rows="3"
        />
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Ocena</label>
        <div>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              className="btn btn-link p-0 me-1"
              onClick={() => ustawOcene(n)}
              aria-label={`Ustaw ocenę ${n} na 6`}
              style={{ textDecoration: "none" }}
            >
              {n <= ocena ? "★" : "☆"}
            </button>
          ))}
          <span className="ms-2 text-muted">{ocena ? `${ocena}/6` : ""}</span>
        </div>
      </div>

      <input
        type="submit"
        name="submit"
        className="btn btn-primary add-book-btn"
        value={trybEdycji ? "Zapisz zmiany" : "Dodaj książkę"}
      />
    </form>
  );
}

export default Formularz;
