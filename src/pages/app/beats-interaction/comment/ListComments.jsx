
// --- Datos mock ---


// --- Componente ---
const ListComments = (isBeat = false) => {
  return (
    <div>
      <h2>Lista de Comentarios {isBeat ? "del Beat" : "de la Playlist"}</h2>
      {/* Aquí iría la lógica para listar los comentarios */}
    </div>
  );
};

export default ListComments;
