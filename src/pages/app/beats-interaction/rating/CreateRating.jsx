import { useState } from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import {
  createBeatRating,
  createPlaylistRating,
} from "../../../../services/beats-interaction/ratingService";
import "./CreateRating.css";


const MAX_SCORE = 5;

const showApiError = (error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  alert(error?.response?.data?.message || fallbackMessage);
};

const CreateRating = ({ isBeat = false, resourceId, onRatingCreated }) => {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resourceId || score <= 0 || submitting) return;

    const trimmed = comment.trim();
    const payload = {
      score,
      comment: trimmed ? trimmed : null,
    };

    try {
      setSubmitting(true);

      const response = isBeat
        ? await createBeatRating(resourceId, payload)
        : await createPlaylistRating(resourceId, payload);

      const createdRating = response?.data?.data ?? response?.data ?? null;

      setScore(0);
      setComment("");

      if (onRatingCreated) {
        onRatingCreated(createdRating);
      }
    } catch (error) {
      showApiError(error, "Error creando valoración");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-rating" onSubmit={handleSubmit}>
      <div className="create-rating-title">
        Puntúa esta {isBeat ? "beat" : "playlist"}
      </div>

      <div className="create-rating-stars">
        {Array.from({ length: MAX_SCORE }).map((_, index) => {
          const starValue = index + 1;
          const filled = hoverScore
            ? starValue <= hoverScore
            : starValue <= score;

          return (
            <span
              key={starValue}
              className={`create-rating-star ${
                filled ? "create-rating-star--filled" : ""
              }`}
              onMouseEnter={() => setHoverScore(starValue)}
              onMouseLeave={() => setHoverScore(null)}
              onClick={() => setScore(starValue)}
            >
              ★
            </span>
          );
        })}
      </div>

      <Input
        fullWidth
        placeholder="Comentario (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="create-rating-input"
      />

      <Button
        type="submit"
        variant="primary"
        size="small"
        disabled={score === 0 || submitting || !resourceId}
      >
        {submitting ? "Enviando..." : "Enviar valoración"}
      </Button>
    </form>
  );
};

export default CreateRating;
