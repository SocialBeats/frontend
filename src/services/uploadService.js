import { client } from '@/api/axiosClient';

/**
 * Obtiene una URL prefirmada para subir archivos a S3
 * @param {string} fileName - Nombre del archivo
 * @param {string} fileType - Tipo MIME del archivo
 * @returns {Promise<{uploadUrl: string, finalUrl: string}>}
 */
async function getPresignedUrl(fileName, fileType) {
  const response = await client.get('/auth/upload/presigned-url', {
    params: { fileName, fileType },
  });
  return response.data;
}

/**
 * Sube un archivo directamente a S3 usando presigned URL
 * @param {string} uploadUrl - URL prefirmada de S3
 * @param {File} file - Archivo a subir
 */
async function uploadToS3(uploadUrl, file) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'x-amz-acl': 'public-read',
    },
  });

  if (!response.ok) {
    throw new Error(`Error subiendo archivo: ${response.status}`);
  }
}

/**
 * Sube un avatar a S3 y retorna la URL final del CDN
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<string>} - URL final del avatar en el CDN
 */
export async function uploadAvatarToS3(file) {
  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    throw new Error('Solo se permiten archivos de imagen');
  }

  // Validar tamaño máximo (5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('El archivo es demasiado grande. Máximo 5MB');
  }

  // 1. Obtener URL prefirmada
  const { uploadUrl, finalUrl } = await getPresignedUrl(file.name, file.type);

  // 2. Subir directamente a S3
  await uploadToS3(uploadUrl, file);

  // 3. Retornar URL final del CDN
  return finalUrl;
}
