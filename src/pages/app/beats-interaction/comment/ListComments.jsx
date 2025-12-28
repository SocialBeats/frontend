import { useEffect, useState } from "react";
import Card from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import IconButton from "../../../../components/ui/IconButton";
import Modal from "../../../../components/ui/Modal";
// import { getBeatComments, getPlaylistComments } from "@/services/beats-interaction/commentService.js";
// import { deleteComment, updateComment } from "@/services/beats-interaction/commentService.js";
import CreateComment from "./CreateComment";
import "./ListComments.css";

// --- Datos mock ----------------------------------------------------------
const MOCK_CURRENT_USER_ID = "u1";

const MOCK_COMMENTS = [
  {
    _id: "c1",
    text: "Esta playlist está brutal para concentrarse 👌. Esta durísima me gusta mucho, alargo el texto para ver como se comporta pasados ciertos caracteressss.",
    authorId: "u1",
    author: {
      _id: "u1",
      username: "BeatMaster",
      email: "beatmaster@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T10:00:00.000Z",
  },
  {
    _id: "c2",
    text: "El tercer beat es literalmente mi favorito 🔥🔥",
    authorId: "u1",
    author: {
      _id: "u1",
      username: "BeatMaster",
      email: "beatmaster@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T11:10:00.000Z",
  },
  {
    _id: "c3",
    text: "Buenísima selección, me la guardo para producir luego 🙌",
    authorId: "u2",
    author: {
      _id: "u2",
      username: "LofiKid",
      email: "lofikid@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T12:45:00.000Z",
  },
  {
    _id: "c4",
    text: "Bro pero el beat 5 suena INSANO 😳",
    authorId: "u3",
    author: {
      _id: "u3",
      username: "808Destroyer",
      email: "808destroyer@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T13:22:00.000Z",
  },
  {
    _id: "c5",
    text: "Me encanta cómo fluye toda la playlist, muy buen gusto 👏",
    authorId: "u4",
    author: {
      _id: "u4",
      username: "NeoSoul",
      email: "neosoul@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T14:01:00.000Z",
  },
  {
    _id: "c6",
    text: "Perfecta para estudiar, gracias por compartirla 🙏",
    authorId: "u5",
    author: {
      _id: "u5",
      username: "StudyBeats",
      email: "studybeats@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T15:10:00.000Z",
  },
  {
    _id: "c7",
    text: "No suelo comentar, pero esta lista está increíble 🔥",
    authorId: "u6",
    author: {
      _id: "u6",
      username: "SilentProducer",
      email: "silent@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T16:40:00.000Z",
  },
  {
    _id: "c8",
    text: "El beat 2 me recordó a J Dilla, qué locura 😮‍💨",
    authorId: "u2",
    author: {
      _id: "u2",
      username: "LofiKid",
      email: "lofikid@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T18:03:00.000Z",
  },
  {
    _id: "c9",
    text: "Me inspira muchísimo esta playlist, gracias!",
    authorId: "u7",
    author: {
      _id: "u7",
      username: "DreamFlow",
      email: "dreamflow@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T18:47:00.000Z",
  },
  {
    _id: "c10",
    text: "La tengo en loop desde hace dos horas 😂",
    authorId: "u1",
    author: {
      _id: "u1",
      username: "BeatMaster",
      email: "beatmaster@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T19:15:00.000Z",
  },
  {
    _id: "c11",
    text: "Muy chill, perfecta para viajes largos 🚗💨",
    authorId: "u8",
    author: {
      _id: "u8",
      username: "RoadVibes",
      email: "roadvibes@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T20:22:00.000Z",
  },
  {
    _id: "c12",
    text: "El beat final me ha volado la cabeza 🔥🤯",
    authorId: "u3",
    author: {
      _id: "u3",
      username: "808Destroyer",
      email: "808destroyer@example.com",
      roles: ["beatmaker"],
    },
    createdAt: "2025-11-23T21:10:00.000Z",
  },
];

// --- Componente ----------------------------------------------------------
const ListComments = ({ isBeat = false, resourceId }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalComments, setTotalComments] = useState(MOCK_COMMENTS.length);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const safeLimit = limit <= 0 ? 1 : limit;
  const totalPages = totalComments > 0 ? Math.ceil(totalComments / safeLimit) : 1;

  useEffect(() => {
    const startIndex = (page - 1) * safeLimit;
    const endIndex = startIndex + safeLimit;
    const pageItems = MOCK_COMMENTS.slice(startIndex, endIndex);

    setComments(pageItems);
    setTotalComments(MOCK_COMMENTS.length);

    /*
    // Versión real con backend:
    async function fetchComments() {
      try {
        const response = isBeat
          ? await getBeatComments(resourceId, { page, limit: safeLimit })
          : await getPlaylistComments(resourceId, { page, limit: safeLimit });

        const items = response.data.data || [];

        setComments(
          items.map((item) => ({
            _id: item._id,
            text: item.text,
            authorId: item.authorId,
            author: item.author,
            createdAt: item.createdAt,
          }))
        );
        setTotalComments(response.data.total ?? items.length);
      } catch (error) {
        console.error("Error cargando comentarios", error);
      }
    }

    if (resourceId) {
      fetchComments();
    }
    */
  }, [isBeat, resourceId, page, safeLimit]);

  // --- pagination handlers ---------------------------------------------------------------------
  const handleLimitChange = (e) => {
    const value = parseInt(e.target.value, 10);

    if (Number.isNaN(value) || value <= 0) {
      setLimit(1);
      setPage(1);
      return;
    }

    setLimit(value);
    setPage(1);
  };

  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value, 10);

    if (Number.isNaN(value)) return;

    if (value < 1 || value > totalPages) {
      setPage(1);
      return;
    }

    setPage(value);
  };

  const goFirstPage = () => setPage(1);
  const goPrevPage = () => setPage((prev) => (prev <= 1 ? 1 : prev - 1));
  const goNextPage = () => setPage((prev) => (prev >= totalPages ? totalPages : prev + 1));
  const goLastPage = () => setPage(totalPages);

  // --- delete handlers -------------------------------------------------------------------------
  const openDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    // MOCK: por ahora solo log
    console.log(`Eliminar comentario con id "${commentToDelete._id}"`);
    /*
    // Versión real con backend:
    try {
      await deleteComment(commentToDelete._id);

      // Opción 1 (recomendado): volver a pedir la página actual al backend
      // await fetchComments();

      // Opción 2: actualizar solo el estado local
      // setComments((prev) => prev.filter((c) => c._id !== commentToDelete._id));
      // setTotalComments((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error eliminando comentario", error);
    }
    */
    closeDeleteModal();
  };

  // --- edit handlers ---------------------------------------------------------------------------
  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditingText(comment.text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (commentId) => {
    const textTrimmed = editingText.trim();
    if (!textTrimmed) return;

    // MOCK: de momento solo log
    console.log(
      `Editar comentario con id "${commentId}" y nuevo texto "${textTrimmed}"`
    );
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
              ...c,
              text: textTrimmed,
            }
          : c
      )
    );
    cancelEditing();
    //

    /*
    // Versión real con backend (PUT o PATCH):
    try {
      // Reemplazo completo del texto
      // const response = await updateComment(commentId, { text: textTrimmed });

      // const updatedComment = response.data.data;

      // Opción 1: recargar página de comentarios
      // await fetchComments();

      // Opción 2: actualizar solo en memoria
      // setComments((prev) =>
      //   prev.map((c) => (c._id === updatedComment._id ? updatedComment : c))
      // );

      // cancelEditing();
    } catch (error) {
      console.error("Error editando comentario", error);
      // Podrías mostrar un toast de error
    }
    */
  };

  return (
    <div className="comments-section">
      <Card className="comments-section-card">
        <div className="comments-section-header">
          <h2 className="comments-section-title">Comentarios</h2>
          {totalComments > 0 && (
            <span className="comments-count">
              {totalComments} comentario{totalComments !== 1 && "s"}
            </span>
          )}
        </div>

        {totalComments === 0 ? (
          <p className="comments-empty">Todavía no hay comentarios.</p>
        ) : (
          <div className="comments-list comments-list--scroll">
            {comments.map((comment) => {
              const username = comment.author?.username || "Usuario anónimo";
              const isMyComment = comment.authorId === MOCK_CURRENT_USER_ID;
              const isEditing = editingCommentId === comment._id;

              return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-row">
                    <div className="comment-left">
                      <div className="comment-main-line">
                        <span className="comment-author">{username}:</span>
                        {isEditing ? (
                          <Input
                            fullWidth
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="comment-edit-input"
                            placeholder="Edita tu comentario..."
                          />
                        ) : (
                          <span className="comment-text">{comment.text}</span>
                        )}
                      </div>

                      {comment.createdAt && (
                        <div className="comment-meta">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      )}

                      {isEditing && (
                        <div className="comment-edit-actions">
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleSaveEdit(comment._id)}
                            disabled={!editingText.trim()}
                          >
                            Guardar
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="comment-right">
                      {isMyComment && (
                        <div className="comment-actions">
                          <IconButton
                            variant="ghost"
                            onClick={() => startEditing(comment)}
                            title="Editar comentario"
                          >
                            ✏️
                          </IconButton>
                          <IconButton
                            variant="ghost"
                            onClick={() => openDeleteModal(comment)}
                            title="Eliminar comentario"
                          >
                            🗑️
                          </IconButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateComment
          isBeat={isBeat}
          resourceId={resourceId}
          // onCommentCreated={(newComment) => {
          //   setComments((prev) => [newComment, ...prev]);
          //   setTotalComments((prev) => prev + 1);
          // }}
        />

        {totalComments > 0 && (
          <div className="comments-footer">
            <div className="comments-pagination-buttons comments-pagination-buttons-left">
              <Button
                variant="primary"
                size="small"
                onClick={goFirstPage}
                disabled={page === 1}
              >
                {"<<"}
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={goPrevPage}
                disabled={page === 1}
              >
                {"<"}
              </Button>
            </div>

            <div className="comments-pagination-center">
              <div className="comments-pagination-line">
                <span>Página</span>
                <div className="comments-input-wrapper">
                  <Input
                    type="number"
                    value={page}
                    onChange={handlePageInputChange}
                    min={1}
                    className="comments-input"
                  />
                </div>
                <span>de {totalPages}</span>
              </div>

              <div className="comments-pagination-line">
                <span>Comentarios por página:</span>
                <div className="comments-input-wrapper">
                  <Input
                    type="number"
                    value={limit}
                    onChange={handleLimitChange}
                    min={1}
                    className="comments-input"
                  />
                </div>
              </div>
            </div>

            <div className="comments-pagination-buttons comments-pagination-buttons-right">
              <Button
                variant="primary"
                size="small"
                onClick={goNextPage}
                disabled={page === totalPages}
              >
                {">"}
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={goLastPage}
                disabled={page === totalPages}
              >
                {">>"}
              </Button>
            </div>
          </div>
        )}

        <Modal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          title="Eliminar comentario"
        >
          <div className="comment-delete-modal">
            <p>¿Seguro que quieres eliminar este comentario?</p>
            <div className="modal-buttons">
              <Button
                variant="primary"
                onClick={closeDeleteModal}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
              >
                Borrar
              </Button>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default ListComments;
