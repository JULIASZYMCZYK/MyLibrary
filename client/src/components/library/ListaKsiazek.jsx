import "./ListaKsiazek.css";

function ListaKsiazek({ biblioteka, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="books-table">
        {/* Stałe szerokości kolumn – tabela nie „rozjeżdża się” */}
        <colgroup>
          <col style={{ width: "20%" }} /> {/* Tytuł */}
          <col style={{ width: "15%" }} /> {/* Autor */}
          <col style={{ width: "12%" }} /> {/* Gatunki */}
          <col style={{ width: "10%" }} /> {/* Motywy */}
          <col style={{ width: "12%" }} /> {/* Status */}
          <col style={{ width: "6%" }} />  {/* Ocena */}
          <col style={{ width: "15%" }} /> {/* Przemyślenia */}
          <col style={{ width: "10%" }} /> {/* Akcje */}
        </colgroup>

        <thead>
          <tr>
            <th>Tytuł książki</th>
            <th>Autor</th>
            <th>Gatunki</th>
            <th>Motywy</th>
            <th>Status</th>
            <th>Ocena</th>
            <th>Własne przemyślenia</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {/* Każda książka = jeden wiersz */}
          {biblioteka.map((b) => (
            <tr key={b._id}>
              <td>{b.title}</td>
              <td>{b.author}</td>

              {/* Lista gatunków połączona przecinkami */}
              <td>{(b.genres || []).join(", ")}</td>

              {/* Lista motywów (tropes) */}
              <td>{(b.tropes || []).join(", ")}</td>

              <td>{b.status}</td>

              {/* Ocena jako gwiazdki */}
              <td>{"★".repeat(b.rating || 0)}</td>

              <td>{b.comment}</td>

              {/* Przyciski akcji */}
              <td>
                <div className="actions">
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => onEdit(b)}
                  >
                    Edytuj
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(b._id)}
                  >
                    Usuń
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListaKsiazek;
