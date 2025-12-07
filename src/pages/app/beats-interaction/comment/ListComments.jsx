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
  const [showAll, setShowAll] = useState(false);

  // MOCK DATA
  useEffect(() => {
    setComments(MOCK_COMMENTS);
    /*
    async function fetchComments() {
      try {
        const response = isBeat
          ? await getBeatComments(resourceId, { page: 1, limit: 50 })
          : await getPlaylistComments(resourceId, { page: 1, limit: 50 });

        // Respuesta esperada del backend:
        // {
        //   data: [
        //     {
        //       _id,
        //       beatId,
        //       playlistId,
        //       authorId,
        //       author: { _id, username, email, roles, createdAt, updatedAt, ... },
        //       text,
        //       createdAt,
        //       updatedAt
        //     }
        //   ],
        //   page,
        //   limit,
        //   total
        // }

        const items = response.data.data || [];

        setComments(
          items.map((item) => ({
            _id: item._id,
            text: item.text,
            authorId: item.authorId,    // lo guardamos por si hace falta para permisos o filtros
            author: item.author,        // objeto completo (sin password gracias al toJSON del modelo)
            createdAt: item.createdAt,
          }))
        );
      } catch (error) {
        console.error("Error cargando comentarios", error);
      }
    }

    if (resourceId) {
      fetchComments();
    }
    */
  }, [isBeat, resourceId]);

  const hasMoreThanThree = comments.length > 3;
  const commentsToShow =
    showAll || !hasMoreThanThree ? comments : comments.slice(0, 3);

  return (
    <div className="comments-section">
      <Card className="comments-section-card">
        <div className="comments-section-header">
          <h2 className="comments-section-title">Comentarios</h2>
          {comments.length > 0 && (
            <span className="comments-count">
              {comments.length} comentario{comments.length !== 1 && "s"}
            </span>
          )}
        </div>

        {comments.length === 0 ? (
          <p className="comments-empty">Todavía no hay comentarios.</p>
        ) : (
          <div
            className={
              "comments-list" +
              (showAll && hasMoreThanThree ? " comments-list--scroll" : "")
            }
          >
            {commentsToShow.map((comment) => {
              const username = comment.author?.username || "Usuario anónimo";

              return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-main-line">
                    <span className="comment-author">{username}</span>
                    <span className="comment-separator">: </span>
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

        {hasMoreThanThree && (
          <div className="comments-footer">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Ver menos" : "Ver más"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ListComments;
