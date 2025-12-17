/**
 * Mock data for beat metrics
 * This will be replaced with real API calls later
 */

export const mockBeatMetrics = {
  beatId: "mock-beat-123",

  // Core Metrics - Para el gráfico de araña
  coreMetrics: {
    energy: 0.83,
    dynamism: 0.61,
    percussiveness: 0.74,
    brigthness: 0.56,
    density: 0.72,
    richness: 0.68
  },

  // Extra Metrics
  extraMetrics: {
    // Tempo
    bpm: 128,
    num_beats: 512,
    mean_duration: 0.469,
    beats_position: 1.7717188208616776, // Posición del primer beat en segundos
    song_duration: 180, // Duración total de la canción en segundos

    // Tonalidad
    key: "F# Minor",
    uniformity: 0.85,
    stability: 0.92,
    chroma_features: {
      C: 0.3, 'C#': 0.8, D: 0.2, 'D#': 0.5, E: 0.6, F: 0.1,
      'F#': 0.4, G: 0.3, 'G#': 0.7, A: 0.2, 'A#': 0.4, B: 0.5
    },

    // Potencia Sonora
    decibels: 75.3,

    // Perfil Melódico
    hz_range: 250,
    mean_hz: 440,

    // Textura
    character: "Brillante",
    opening: 0.78,

    // Articulación
    style: "Staccato",
    suddent_changes: 127,
    soft_changes: 89,
    ratio_sudden_soft: 1.43
  }
};

export const getMockMetrics = (beatId) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockBeatMetrics), 500);
  });
};