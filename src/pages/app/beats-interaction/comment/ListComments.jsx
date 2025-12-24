import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import IconButton from "../../../../components/ui/IconButton";
import Modal from "../../../../components/ui/Modal";
import {
  getBeatComments,
  getPlaylistComments,
  deleteComment,
  updateComment,
} from "../../../../services/beats-interaction/commentService.js";
import { getCurrentUserId } from "../../../../services/authService";
import CreateComment from "./CreateComment";
import "./ListComments.css";

const showApiError = (error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  alert(error?.response?.data?.message || fallbackMessage);
};

const ListComments = ({ isBeat, resourceId }) => {
  const currentUserId = getCurrentUserId();

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalComments, setTotalComments] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const safeLimit = useMemo(() => (limit <= 0 ? 1 : limit), [limit]);
  const totalPages = useMemo(() => {
    return totalComments > 0 ? Math.ceil(totalComments / safeLimit) : 1;
  }, [totalComments, safeLimit]);

  const fetchComments = useCallback(async () => {
    if (!resourceId) return;

    try {
      const response = isBeat
        ? await getBeatComments(resourceId, { page, limit: safeLimit })
        : await getPlaylistComments(resourceId, { page, limit: safeLimit });

      const payload = response?.data ?? {};
      const items = payload.data ?? payload?.data?.data ?? [];
      const total =
        payload.total ??
        payload.count ??
        payload?.data?.total ??
        payload?.data?.count ??
        items.length;

      setComments(
        (items || []).map((item) => ({
          _id: item._id,
          text: item.text,
          authorId: item.authorId,
          author: item.author,
          updatedAt: item.updatedAt,
        }))
      );

      setTotalComments(Number(total) || 0);

      const newTotalPages =
        (Number(total) || 0) > 0
          ? Math.ceil((Number(total) || 0) / safeLimit)
          : 1;
      if (page > newTotalPages) setPage(newTotalPages);
    } catch (error) {
      showApiError(error, "Error cargando comentarios");
      setComments([]);
      setTotalComments(0);
    }
  }, [isBeat, resourceId, page, safeLimit]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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

  const openDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete?._id) return;

    try {
      await deleteComment(commentToDelete._id);
      closeDeleteModal();
      await fetchComments();
    } catch (error) {
      showApiError(error, "Error eliminando comentario");
      closeDeleteModal();
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditingText(comment.text || "");
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (commentId) => {
    const textTrimmed = editingText.trim();
    if (!textTrimmed) return;

    try {
      const response = await updateComment(commentId, { text: textTrimmed });
      const updated = response?.data?.data ?? response?.data ?? null;

      if (updated?._id) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === updated._id
              ? {
                  ...c,
                  text: updated.text ?? textTrimmed,
                  authorId: updated.authorId ?? c.authorId,
                  author: updated.author ?? c.author,
                  updatedAt: updated.updatedAt ?? c.updatedAt,
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, text: textTrimmed } : c
          )
        );
      }

      cancelEditing();
    } catch (error) {
      showApiError(error, "Error editando comentario");
    }
  };

  return (
    <div className="comments-section">
      <Card className="comments-section-card">
        <div className="comments-section-header">
          <h2 className="comments-section-title">Comentarios</h2>
          {totalComments > 0 && (
            <span className="comments-count">
              <strong>{totalComments}</strong> comentario
              {totalComments !== 1 && "s"}
            </span>
          )}
        </div>

        {totalComments === 0 ? (
          <p className="comments-empty">Todavía no hay comentarios.</p>
        ) : (
          <div className="comments-list comments-list--scroll">
            {comments.map((comment) => {
              const username = comment.author?.username || "Usuario anónimo";
              const isMyComment =
                !!currentUserId && comment.authorId === currentUserId;
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

                      {comment.updatedAt && (
                        <div className="comment-meta">
                          {new Date(comment.updatedAt).toLocaleString()}
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
          onCommentCreated={() => {
            setPage(1);
            fetchComments();
          }}
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
              <Button variant="primary" onClick={closeDeleteModal}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
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
