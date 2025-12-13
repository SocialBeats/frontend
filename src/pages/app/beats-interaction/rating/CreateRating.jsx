import { useState } from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
// import { createBeatRating, createPlaylistRating } from "@/services/beats-interaction/ratingService";
import "./CreateRating.css";

const MAX_SCORE = 5;

const CreateRating = ({ isBeat = false, resourceId, onRatingCreated }) => {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resourceId || score <= 0) return;

    const payload = {
      score,
      comment: comment.trim() ? comment.trim() : null,
    };

    // MOCK
    console.log("Crear valoración:", {
      resourceId,
      isBeat,
      payload,
    });

    // Simulamos creación correcta
    if (onRatingCreated) {
      onRatingCreated({
        _id: "mock-my-rating",
        score: payload.score,
        comment: payload.comment,
      });
    }

    setScore(0);
    setComment("");

    /*
    // Versión real con backend
    try {
      setSubmitting(true);

      const response = isBeat
        ? await createBeatRating(resourceId, payload)
        : await createPlaylistRating(resourceId, payload);

      const createdRating = response.data?.data;

      if (onRatingCreated && createdRating) {
        onRatingCreated(createdRating);
      }
    } catch (error) {
      console.error("Error creando valoración", error);
    } finally {
      setSubmitting(false);
    }
    */
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
        Enviar valoración
      </Button>
    </form>
  );
};

export default CreateRating;
