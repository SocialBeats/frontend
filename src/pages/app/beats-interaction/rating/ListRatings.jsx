import { useEffect, useMemo, useState } from "react";
import Card from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import IconButton from "../../../../components/ui/IconButton";
// import { getBeatRatings, getPlaylistRatings, getMyBeatRating, getMyPlaylistRating, patchRating, deleteRating } from "@/services/beats-interaction/ratingService";
import CreateRating from "./CreateRating";
import "./ListRatings.css";

// --- Datos mock (playlist) --------------------------------------------------------
const MOCK_RATINGS = [
  {
    _id: "r1",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u1",
    user: {
      _id: "u1",
      username: "BeatMaster",
      email: "beatmaster@example.com",
      roles: ["beatmaker"],
    },
    score: 5,
    comment: "Esta playlist está increíble, la tengo en loop 🔥",
    createdAt: "2025-11-23T10:00:00.000Z",
    updatedAt: "2025-11-23T11:00:00.000Z",
  },
  {
    _id: "r2",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u2",
    user: {
      _id: "u2",
      username: "LofiKid",
      email: "lofikid@example.com",
      roles: ["beatmaker"],
    },
    score: 4,
    comment: "Muy buen rollo, perfecta para estudiar 👌",
    createdAt: "2025-11-23T12:15:00.000Z",
    updatedAt: "2025-11-23T12:45:00.000Z",
  },
  {
    _id: "r3",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u3",
    user: {
      _id: "u3",
      username: "808Destroyer",
      email: "808destroyer@example.com",
      roles: ["beatmaker"],
    },
    score: 3,
    comment: null,
    createdAt: "2025-11-23T13:30:00.000Z",
    updatedAt: "2025-11-23T13:30:00.000Z",
  },
  {
    _id: "r4",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u4",
    user: {
      _id: "u4",
      username: "NeoSoul",
      email: "neosoul@example.com",
      roles: ["beatmaker"],
    },
    score: 5,
    comment: "Selección muy fina, armonías increíbles ✨",
    createdAt: "2025-11-23T14:05:00.000Z",
    updatedAt: "2025-11-23T14:05:00.000Z",
  },
  {
    _id: "r5",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u5",
    user: {
      _id: "u5",
      username: "StudyBeats",
      email: "studybeats@example.com",
      roles: ["beatmaker"],
    },
    score: 4,
    comment: null,
    createdAt: "2025-11-23T15:20:00.000Z",
    updatedAt: "2025-11-23T15:20:00.000Z",
  },
  {
    _id: "r6",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u6",
    user: {
      _id: "u6",
      username: "SilentProducer",
      email: "silent@example.com",
      roles: ["beatmaker"],
    },
    score: 5,
    comment: "No suelo valorar, pero esta playlist lo merece 🔥",
    createdAt: "2025-11-23T16:40:00.000Z",
    updatedAt: "2025-11-23T16:40:00.000Z",
  },
  {
    _id: "r7",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u7",
    user: {
      _id: "u7",
      username: "DreamFlow",
      email: "dreamflow@example.com",
      roles: ["beatmaker"],
    },
    score: 4,
    comment: "Fluye súper bien de principio a fin.",
    createdAt: "2025-11-23T18:03:00.000Z",
    updatedAt: "2025-11-23T18:03:00.000Z",
  },
  {
    _id: "r8",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u8",
    user: {
      _id: "u8",
      username: "RoadVibes",
      email: "roadvibes@example.com",
      roles: ["beatmaker"],
    },
    score: 5,
    comment: "Perfecta para viajes largos 🚗💨",
    createdAt: "2025-11-23T19:10:00.000Z",
    updatedAt: "2025-11-23T19:10:00.000Z",
  },
  {
    _id: "r9",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u9",
    user: {
      _id: "u9",
      username: "ChillWave",
      email: "chillwave@example.com",
      roles: ["beatmaker"],
    },
    score: 4,
    comment: "Muy chill, la pongo de fondo todo el día.",
    createdAt: "2025-11-23T20:05:00.000Z",
    updatedAt: "2025-11-23T20:05:00.000Z",
  },
  {
    _id: "r10",
    beatId: null,
    playlistId: "playlistId1",
    userId: "u10",
    user: {
      _id: "u10",
      username: "NightOwl",
      email: "nightowl@example.com",
      roles: ["beatmaker"],
    },
    score: 5,
    comment: "De mis playlists favoritas para producir de noche 🌙",
    createdAt: "2025-11-23T21:15:00.000Z",
    updatedAt: "2025-11-23T21:15:00.000Z",
  },
];

const MOCK_CURRENT_USER_ID = "u5";
const MOCK_MY_RATING =
  MOCK_RATINGS.find((rating) => rating.userId === MOCK_CURRENT_USER_ID) || null;

const MAX_SCORE = 5;

// --- Helpers ----------------------------------------------------------------------
function renderStars(score) {
  const rounded = Math.round(score ?? 0);
  const stars = [];

  for (let i = 1; i <= 5; i += 1) {
    stars.push(
      <span
        key={i}
        className={
          i <= rounded ? "rating-star rating-star--filled" : "rating-star"
        }
      >
        ★
      </span>
    );
  }
  return stars;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeAverage(ratingsArr) {
  if (!ratingsArr || ratingsArr.length === 0) return null;
  const sum = ratingsArr.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
  return sum / ratingsArr.length;
}

// --- Componente -------------------------------------------------------------------
const ListRatings = ({ isBeat = false, resourceId }) => {
  const [allRatings, setAllRatings] = useState(MOCK_RATINGS);

  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalRatings, setTotalRatings] = useState(MOCK_RATINGS.length);

  const [myRating, setMyRating] = useState(null);

  const [editingRatingId, setEditingRatingId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingScore, setEditingScore] = useState(0);
  const [editingHoverScore, setEditingHoverScore] = useState(null);

  const safeLimit = limit <= 0 ? 1 : limit;

  const totalPages = useMemo(() => {
    return totalRatings > 0 ? Math.ceil(totalRatings / safeLimit) : 1;
  }, [totalRatings, safeLimit]);

  useEffect(() => {
    // MOCK: paginación igual que comentarios (pero sobre allRatings)
    const startIndex = (page - 1) * safeLimit;
    const endIndex = startIndex + safeLimit;
    const pageItems = allRatings.slice(startIndex, endIndex);

    setRatings(pageItems);

    const newCount = allRatings.length;
    setTotalRatings(newCount);
    setCount(newCount);
    setAverage(computeAverage(allRatings));

    // MOCK: simulamos que ya tenemos la valoración del usuario actual
    // (la recalculamos a partir de allRatings para que al editar/borrar se vea)
    const mine =
      allRatings.find((r) => r.userId === MOCK_CURRENT_USER_ID) || null;
    setMyRating(mine);

    // si nos quedamos en una página inválida tras borrar
    const newTotalPages = newCount > 0 ? Math.ceil(newCount / safeLimit) : 1;
    if (page > newTotalPages) setPage(newTotalPages);

    /*
    // Versión real con backend
    async function fetchRatings() {
      if (!resourceId) return;

      try {
        const response = isBeat
          ? await getBeatRatings(resourceId, { page, limit: safeLimit })
          : await getPlaylistRatings(resourceId, { page, limit: safeLimit });

        const payload = response.data || {};
        const items = payload.data || [];

        setRatings(items);
        setAverage(typeof payload.average === "number" ? payload.average : null);
        setCount(typeof payload.count === "number" ? payload.count : items.length);

        setTotalRatings(
          typeof payload.total === "number"
            ? payload.total
            : (payload.count ?? items.length)
        );
      } catch (error) {
        console.error("Error cargando valoraciones", error);
      }
    }

    async function fetchMyRating() {
      if (!resourceId) return;

      try {
        const response = isBeat
          ? await getMyBeatRating(resourceId)
          : await getMyPlaylistRating(resourceId);

        const rating = response.data?.data ?? null;
        setMyRating(rating);
      } catch (error) {
        console.error("Error cargando mi valoración", error);
      }
    }

    fetchRatings();
    fetchMyRating();
    */
  }, [isBeat, resourceId, page, safeLimit, allRatings]);

  // --- pagination handlers --------------------------------------------------------
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
  const goNextPage = () =>
    setPage((prev) => (prev >= totalPages ? totalPages : prev + 1));
  const goLastPage = () => setPage(totalPages);

  // --- edition handlers -----------------------------------------------------------
  const startEditing = (rating) => {
    setEditingRatingId(rating._id);
    setEditingComment(rating.comment ?? "");
    setEditingScore(rating.score ?? 0);
    setEditingHoverScore(null);
  };

  const cancelEditing = () => {
    setEditingRatingId(null);
    setEditingComment("");
    setEditingScore(0);
    setEditingHoverScore(null);
  };

  const handleSaveEdit = async (ratingId) => {
    const trimmed = editingComment.trim();
    const newComment = trimmed ? trimmed : null;

    const newScore = Number(editingScore);
    if (!newScore || newScore < 1 || newScore > 5) return;

    // MOCK
    console.log(`Editar rating "${ratingId}" =>`, {
      score: newScore,
      comment: newComment,
    });

    setAllRatings((prev) =>
      prev.map((r) =>
        r._id === ratingId
          ? {
              ...r,
              score: newScore,
              comment: newComment,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    cancelEditing();

    /*
    // Versión real con backend (PATCH recomendado)
    try {
      await patchRating(ratingId, { score: newScore, comment: newComment });
      // Opción A: volver a pedir myRating y ratings
      // await fetchMyRating(); await fetchRatings();
      // Opción B: actualizar estado local como arriba
    } catch (error) {
      console.error("Error editando rating", error);
    }
    */
  };

  // --- delete handlers ------------------------------------------------------------
  const handleDeleteRating = async (ratingId) => {
    if (editingRatingId === ratingId) cancelEditing();

    // MOCK
    console.log(`Eliminar rating "${ratingId}"`);

    setAllRatings((prev) => prev.filter((r) => r._id !== ratingId));

    /*
    // Versión real con backend (DELETE)
    try {
      await deleteRating(ratingId);
      // Opción A: volver a pedir myRating y ratings
      // await fetchMyRating(); await fetchRatings();
      // Opción B: actualizar estado local como arriba
    } catch (error) {
      console.error("Error eliminando rating", error);
    }
    */
  };

  const renderEditableStars = () => {
    const active = editingHoverScore ?? editingScore;

    return (
      <div className="rating-edit-stars">
        {Array.from({ length: MAX_SCORE }).map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= active;

          return (
            <span
              key={starValue}
              className={`rating-edit-star ${
                filled ? "rating-edit-star--filled" : ""
              }`}
              onMouseEnter={() => setEditingHoverScore(starValue)}
              onMouseLeave={() => setEditingHoverScore(null)}
              onClick={() => setEditingScore(starValue)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setEditingScore(starValue);
              }}
              title={`Puntuar con ${starValue}`}
            >
              ★
            </span>
          );
        })}
        <span className="rating-edit-score-number">{editingScore}/5</span>
      </div>
    );
  };

  return (
    <div className="ratings-section">
      <Card className="ratings-section-card">
        <div className="ratings-section-header">
          <h2 className="ratings-section-title">Valoraciones</h2>

          {count > 0 ? (
            <span className="ratings-summary">
              Media <strong>{average?.toFixed(1) ?? "-"} / 5</strong> <strong>· {count}</strong>{" "}
              valoración{count !== 1 && "es"}
            </span>
          ) : (
            <span className="ratings-summary ratings-summary--empty">
              Todavía no hay valoraciones.
            </span>
          )}
        </div>

        <div className="my-rating-section">
          {myRating ? (
            <div className="my-rating-card">
              <div className="my-rating-row">
                <div className="my-rating-left">
                  <div className="my-rating-title">Tu valoración ha sido:</div>

                  {editingRatingId === myRating._id ? (
                    <>
                      {renderEditableStars()}

                      <Input
                        fullWidth
                        value={editingComment}
                        onChange={(e) => setEditingComment(e.target.value)}
                        className="rating-edit-input"
                        placeholder="Edita tu comentario..."
                      />

                      <div className="rating-edit-actions rating-edit-actions--center">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleSaveEdit(myRating._id)}
                          disabled={editingScore <= 0}
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
                    </>
                  ) : (
                    <>
                      <div className="my-rating-score-row">
                        <div className="my-rating-stars">
                          {renderStars(myRating.score)}
                        </div>
                        <span className="my-rating-score-number">
                          {myRating.score}/5
                        </span>
                      </div>

                      {myRating.comment !== null && (
                        <div className="my-rating-comment">
                          {myRating.comment}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="my-rating-right">
                  {editingRatingId !== myRating._id && (
                    <>
                      <IconButton
                        variant="ghost"
                        onClick={() => startEditing(myRating)}
                        title="Editar puntuación y comentario"
                      >
                        ✏️
                      </IconButton>

                      <IconButton
                        variant="ghost"
                        onClick={() => handleDeleteRating(myRating._id)}
                        title="Eliminar valoración"
                      >
                        🗑️
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="my-rating-card my-rating-card--empty">
                Todavía no has puntuado esta {isBeat ? "beat" : "playlist"}
              </div>

              <CreateRating
                isBeat={isBeat}
                resourceId={resourceId}
                onRatingCreated={(newRating) => {
                  console.log("Rating creada correctamente", newRating);
                  setMyRating(newRating);
                }}
              />
            </>
          )}
        </div>

        {ratings.length === 0 ? (
          <p className="ratings-empty">Sé el primero en valorar.</p>
        ) : (
          <div className="ratings-list ratings-list--scroll">
            {ratings.map((rating) => {
              const username = rating.user?.username || "Usuario";
              const score = rating.score ?? 0;
              const comment = rating.comment;
              const isMyRating = rating.userId === MOCK_CURRENT_USER_ID;
              const isEditing = editingRatingId === rating._id;

              return (
                <div key={rating._id} className="rating-item">
                  <div className="rating-row">
                    <div className="rating-left">
                      <div className="rating-main-line">
                        <span className="rating-username">{username}</span>

                        {!isEditing ? (
                          <span className="rating-stars-wrapper">
                            <span className="rating-stars">
                              {renderStars(score)}
                            </span>
                            <span className="rating-score-number">
                              {score}/5
                            </span>
                          </span>
                        ) : (
                          renderEditableStars()
                        )}
                      </div>

                      {isEditing ? (
                        <>
                          <Input
                            fullWidth
                            value={editingComment}
                            onChange={(e) => setEditingComment(e.target.value)}
                            className="rating-edit-input"
                            placeholder="Edita tu comentario..."
                          />

                          <div className="rating-edit-actions">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleSaveEdit(rating._id)}
                              disabled={editingScore <= 0}
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
                        </>
                      ) : (
                        <>
                          {comment !== null && (
                            <div className="rating-comment">{comment}</div>
                          )}
                        </>
                      )}

                      {rating.createdAt && (
                        <div className="rating-meta">
                          {formatDate(rating.createdAt)}
                        </div>
                      )}
                    </div>

                    <div className="rating-right">
                      {isMyRating && !isEditing && (
                        <div className="rating-actions">
                          <IconButton
                            variant="ghost"
                            onClick={() => startEditing(rating)}
                            title="Editar puntuación y comentario"
                          >
                            ✏️
                          </IconButton>

                          <IconButton
                            variant="ghost"
                            onClick={() => handleDeleteRating(rating._id)}
                            title="Eliminar valoración"
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

        {totalRatings > 0 && (
          <div className="ratings-footer">
            <div className="ratings-pagination-buttons">
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

            <div className="ratings-pagination-center">
              <div className="ratings-pagination-line">
                <span>Página</span>
                <Input
                  type="number"
                  value={page}
                  onChange={handlePageInputChange}
                  min={1}
                  className="ratings-input"
                />
                <span>de {totalPages}</span>
              </div>

              <div className="ratings-pagination-line">
                <span>Valoraciones por página:</span>
                <Input
                  type="number"
                  value={limit}
                  onChange={handleLimitChange}
                  min={1}
                  className="ratings-input"
                />
              </div>
            </div>

            <div className="ratings-pagination-buttons">
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
      </Card>
    </div>
  );
};

export default ListRatings;
