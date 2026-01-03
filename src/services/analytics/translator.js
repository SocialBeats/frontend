import { client } from '@/api/axiosClient';

/**
 * Azure Translator API Service
 * Provides access to text translation using Azure Translator
 */

/**
 * Translate text from one language to another
 *
 * Features:
 * - Requires authentication
 * - Intelligent caching: Translations are cached for 24 hours based on text + language pair
 * - Cached translations served from Redis for performance
 * - Rate limiting: 30 requests/minute (authenticated users)
 * - Supports automatic language detection
 * - Returns confidence score for detected language
 *
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
 * @param {string} sourceLanguage - Source language code (e.g., 'en', 'es', 'fr')
 * @returns {Promise} Promise with translation data
 *
 * Response format:
 * {
 *   "original_text": "Original text",
 *   "translated_text": "Texto traducido",
 *   "source_language": "en",
 *   "target_language": "es",
 *   "detected_language": "en",
 *   "confidence": 1.0
 * }
 */
export function translateText(text, targetLanguage = 'es', sourceLanguage = 'en') {
  return client.post('/analytics/translate', {
    text,
    target_language: targetLanguage,
    source_language: sourceLanguage
  });
}

/**
 * Get list of all languages supported by Azure Translator
 *
 * Features:
 * - Requires authentication
 * - Cached for 7 days
 * - Returns language codes, names, and native names
 * - Rate limiting: 10 requests/minute
 *
 * @returns {Promise} Promise with supported languages data
 */
export function getSupportedLanguages() {
  return client.get('/analytics/translate/languages');
}

/**
 * Translate a Quotable quote to Spanish
 * Convenience function specifically designed for quotes from Quotable API
 *
 * Features:
 * - Requires authentication
 * - Pre-configured for English to Spanish translation
 * - Same caching and rate limiting as standard translate endpoint
 * - Rate limiting: 30 requests/minute
 *
 * @param {string} text - Quote text to translate
 * @returns {Promise} Promise with translation data
 *
 * Response format:
 * {
 *   "original_text": "Original quote",
 *   "translated_text": "Frase traducida",
 *   "source_language": "en",
 *   "target_language": "es",
 *   "detected_language": "en",
 *   "confidence": 1.0
 * }
 */
export function translateQuote(text) {
  return client.post('/analytics/translate', {
    text,
    target_language: 'es',
    source_language: 'en'
  });
}
