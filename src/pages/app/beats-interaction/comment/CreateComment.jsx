import { useState } from "react";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import {
  createBeatComment,
  createPlaylistComment,
} from "../../../../services/beats-interaction/commentService";
import "./CreateComment.css";

const showApiError = (error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  alert(error?.response?.data?.message || fallbackMessage);
};

const CreateComment = ({ isBeat = false, resourceId, onCommentCreated }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const textTrimmed = text.trim();
    if (!textTrimmed || !resourceId || submitting) return;

    try {
      setSubmitting(true);

      const response = isBeat
        ? await createBeatComment(resourceId, { text: textTrimmed })
        : await createPlaylistComment(resourceId, { text: textTrimmed });

      const createdComment = response?.data?.data ?? response?.data ?? null;

      setText("");

      if (onCommentCreated) {
        onCommentCreated(createdComment);
      }
    } catch (error) {
      showApiError(error, "Error creando comentario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-comment" onSubmit={handleSubmit}>
      <div className="create-comment-input-wrapper">
        <Input
          fullWidth
          placeholder="Escribe un comentario..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="create-comment-input"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="small"
        disabled={!text.trim() || submitting || !resourceId}
        className="create-comment-button"
      >
        {submitting ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
};

export default CreateComment;
