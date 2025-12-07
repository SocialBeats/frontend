import { useEffect, useState } from "react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
//import { getBeatComments, getPlaylistComments } from "@/services/beats-interaction/commentService.js";
import "./ListComments.css";


// --- Datos mock ----------------------------------------------------------
const MOCK_COMMENTS = [
  {
    _id: "c1",
    text: "Esta playlist está brutal para concentrarse 👌",
    authorName: "User1",
    createdAt: "2025-11-23T10:00:00.000Z",
  },
  {
    _id: "c2",
    text: "El tercer beat es mi favorito.",
    authorName: "User1",
    createdAt: "2025-11-23T11:15:00.000Z",
  },
  {
    _id: "c3",
    text: "Me la guardo para luego producir algo encima.",
    authorName: "User2",
    createdAt: "2025-11-24T09:30:00.000Z",
  },
  {
    _id: "c4",
    text: "enhorabuena 🙌",
    authorName: "User3",
    createdAt: "2025-11-24T00:45:00.000Z",
  },
  {
    _id: "c5",
    text: "Buenísima selección 🙌",
    authorName: "User4",
    createdAt: "2025-11-24T11:45:00.000Z",
  },
  {
    _id: "c6",
    text: "selección 🙌",
    authorName: "User4",
    createdAt: "2025-11-24T10:45:00.000Z",
  },
  {
    _id: "c7",
    text: "selección, enhorabuena 🙌",
    authorName: "User4",
    createdAt: "2025-11-24T18:45:00.000Z",
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

        // El backend devuelve:
        // {
        //   data: [ { _id, beatId, playlistId, authorId, text, createdAt, ... } ],
        //   page,
        //   limit,
        //   total
        // }
        const items = response.data.data || [];

        // OJO: en el swagger solo viene authorId, no authorName.
        // Aquí podrías:
        //  - O bien mostrar solo el authorId,
        //  - O bien hacer otra llamada para resolver el nombre,
        //  - O bien pedir que el backend incluya authorName.
        setComments(
          items.map((item) => ({
            _id: item._id,
            text: item.text,
            authorName: item.authorName ?? `User ${item.authorId.slice(0, 4)}`,
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
          <h2 className="comments-section-title">
            Comentarios {isBeat ? "del beat" : "de la playlist"}
          </h2>
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
            {commentsToShow.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-author">
                  {comment.authorName ?? "Usuario anónimo"}
                </div>
                <div className="comment-text">{comment.text}</div>
                {comment.createdAt && (
                  <div className="comment-meta">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
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
