import { useEffect, useState } from "react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
// import { getBeatComments, getPlaylistComments } from "@/services/beats-interaction/commentService.js";
import "./ListComments.css";

// --- Datos mock ----------------------------------------------------------
const MOCK_COMMENTS = [
  {
    _id: "c1",
    text: "Esta playlist está brutal para concentrarse 👌",
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
  const [limit] = useState(5);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    // Simula una respuesta paginada del backend usando MOCK_COMMENTS
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageItems = MOCK_COMMENTS.slice(startIndex, endIndex);
    setComments(pageItems);
    setTotalComments(MOCK_COMMENTS.length);
    /*
    // Versión real con backend:
    async function fetchComments() {
      try {
        const response = isBeat
          ? await getBeatComments(resourceId, { page, limit })
          : await getPlaylistComments(resourceId, { page, limit });

        // Backend devuelve:
        // {
        //   data: [...],
        //   page,
        //   limit,
        //   total
        // }

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
  }, [isBeat, resourceId, page, limit]);

  const totalPages = totalComments > 0 ? Math.ceil(totalComments / limit) : 1;

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
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

              return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-main-line">
                    <span className="comment-author">{username}:</span>
                    <span className="comment-text">{comment.text}</span>
                  </div>
                  {comment.createdAt && (
                    <div className="comment-meta">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalComments > 0 && (
          <div className="comments-footer">
            <span className="comments-pagination-info">
              Página {page} de {totalPages}
            </span>

            <div className="comments-pagination-buttons">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ListComments;
