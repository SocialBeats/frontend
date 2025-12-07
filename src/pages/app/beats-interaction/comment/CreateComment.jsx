import { useState } from "react";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
// import { createBeatComment, createPlaylistComment } from "@/services/beats-interaction/commentService";
import "./CreateComment.css";

const CreateComment = ({ isBeat = false, resourceId, onCommentCreated }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const textTrimmed = text.trim();
    if (!textTrimmed || !resourceId) return;

    // 🔹 MOCK: de momento solo logeamos
    console.log(`Mensaje con texto "${textTrimmed}" creado`);
    // Como es mock, simplemente limpiamos el input
    setText("");

    /*
    // Versión real con backend:
    try {
      setSubmitting(true);

      const response = isBeat
        ? await createBeatComment(resourceId, { text: textTrimmed })
        : await createPlaylistComment(resourceId, { text: textTrimmed });

      // Suponiendo que el backend devuelve el comentario creado en response.data.data
      const createdComment = response.data.data;

      // Notificamos al padre para que lo añada al listado, si nos pasan el callback
      if (onCommentCreated && createdComment) {
        onCommentCreated(createdComment);
      }

      setText("");
    } catch (error) {
      console.error("Error creando comentario", error);
      // Aquí podrías mostrar un toast o mensaje de error al usuario
    } finally {
      setSubmitting(false);
    }
    */
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
        Enviar
      </Button>
    </form>
  );
};

export default CreateComment;
