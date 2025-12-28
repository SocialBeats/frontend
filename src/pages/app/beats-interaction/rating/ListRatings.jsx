import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import IconButton from "../../../../components/ui/IconButton";
import {
  getBeatRatings,
  getPlaylistRatings,
  getMyBeatRating,
  getMyPlaylistRating,
  patchRating,
  deleteRating,
} from "../../../../services/beats-interaction/ratingService";
import { getCurrentUserId } from "../../../../services/authService";
import CreateRating from "./CreateRating";
import "./ListRatings.css";


const MAX_SCORE = 5;

const showApiError = (error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  alert(error?.response?.data?.message || fallbackMessage);
};

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


const ListRatings = ({ isBeat, resourceId }) => {
  const currentUserId = getCurrentUserId();

  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalRatings, setTotalRatings] = useState(0);

  const [myRating, setMyRating] = useState(null);

  const [editingRatingId, setEditingRatingId] = useState(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingScore, setEditingScore] = useState(0);
  const [editingHoverScore, setEditingHoverScore] = useState(null);

  const safeLimit = useMemo(() => (limit <= 0 ? 1 : limit), [limit]);

  const totalPages = useMemo(() => {
    return totalRatings > 0 ? Math.ceil(totalRatings / safeLimit) : 1;
  }, [totalRatings, safeLimit]);

  const fetchRatings = useCallback(async () => {
    if (!resourceId) return;

    try {
      const response = isBeat
        ? await getBeatRatings(resourceId, { page, limit: safeLimit })
        : await getPlaylistRatings(resourceId, { page, limit: safeLimit });

      const payload = response?.data ?? {};
      const items = payload.data ?? payload?.data?.data ?? [];
      const total =
        payload.total ??
        payload.count ??
        payload?.data?.total ??
        payload?.data?.count ??
        items.length;

      setRatings(items || []);
      setAverage(
        typeof payload.average === "number"
          ? payload.average
          : payload?.data?.average ?? null
      );
      setCount(
        typeof payload.count === "number"
          ? payload.count
          : payload?.data?.count ?? Number(total) ?? items.length
      );

      setTotalRatings(Number(total) || 0);

      const newTotalPages =
        (Number(total) || 0) > 0
          ? Math.ceil((Number(total) || 0) / safeLimit)
          : 1;
      if (page > newTotalPages) setPage(newTotalPages);
    } catch (error) {
      showApiError(error, "Error cargando valoraciones");
      setRatings([]);
      setAverage(null);
      setCount(0);
      setTotalRatings(0);
    }
  }, [isBeat, resourceId, page, safeLimit]);

  const fetchMyRating = useCallback(async () => {
    if (!resourceId) return;

    try {
      const response = isBeat
        ? await getMyBeatRating(resourceId)
        : await getMyPlaylistRating(resourceId);

      const rating = response?.data?.data ?? response?.data ?? null;
      setMyRating(rating?._id ? rating : null);
    } catch {
      setMyRating(null);
    }
  }, [isBeat, resourceId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  useEffect(() => {
    fetchMyRating();
  }, [fetchMyRating]);

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

    try {
      const response = await patchRating(ratingId, {
        score: newScore,
        comment: newComment,
      });
      const updated = response?.data?.data ?? response?.data ?? null;

      if (updated?._id) {
        if (myRating?._id === updated._id) setMyRating(updated);

        setRatings((prev) =>
          prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
        );
      } else {
        setRatings((prev) =>
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
        if (myRating?._id === ratingId) {
          setMyRating((prev) =>
            prev
              ? {
                  ...prev,
                  score: newScore,
                  comment: newComment,
                  updatedAt: new Date().toISOString(),
                }
              : prev
          );
        }
      }

      cancelEditing();
      await fetchRatings();
      await fetchMyRating();
    } catch (error) {
      showApiError(error, "Error editando valoración");
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!ratingId) return;
    if (editingRatingId === ratingId) cancelEditing();

    try {
      await deleteRating(ratingId);

      if (myRating?._id === ratingId) setMyRating(null);

      await fetchRatings();
      await fetchMyRating();
    } catch (error) {
      showApiError(error, "Error eliminando valoración");
    }
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
            <>
              <span className="ratings-summary">
                Media{" "}
                <strong>
                  {typeof average === "number" ? average.toFixed(1) : "-"} / 5
                </strong>
              </span>
              <span className="ratings-summary">
                <strong>{count}</strong>{" "}
                {count === 1 ? "valoración" : "valoraciones"}
              </span>
            </>
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
                Todavía no has puntuado {isBeat ? "este beat" : "esta playlist"}
              </div>

              <CreateRating
                isBeat={isBeat}
                resourceId={resourceId}
                onRatingCreated={async () => {
                  setPage(1);
                  await fetchMyRating();
                  await fetchRatings();
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

              const isMyRating =
                !!currentUserId && rating.userId === currentUserId;
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

                      {(rating.updatedAt || rating.createdAt) && (
                        <div className="rating-meta">
                          {formatDate(rating.updatedAt || rating.createdAt)}
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
