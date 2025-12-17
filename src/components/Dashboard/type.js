export const WIDGET_SECTIONS = {
  CORE: 'Métricas Core',
  TEMPO: 'Tempo',
  TONALIDAD: 'Tonalidad',
  PERFIL_MELODICO: 'Perfil Melódico',
  DINAMICA: 'Dinámica',
  TEXTURA: 'Textura',
  ARTICULACION: 'Articulación'
};

export const AVAILABLE_WIDGETS = [
  // Métricas Core
  {
    type: 'spider',
    title: 'Diagrama Spider',
    section: WIDGET_SECTIONS.CORE,
    description: 'Visualización de las 6 métricas principales'
  },

  // Tempo
  {
    type: 'bpm',
    title: 'BPM',
    section: WIDGET_SECTIONS.TEMPO,
    description: 'Beats por minuto'
  },
  {
    type: 'num_beats',
    title: 'Número de Beats',
    section: WIDGET_SECTIONS.TEMPO,
    description: 'Total de beats detectados'
  },
  {
    type: 'duracion_promedio',
    title: 'Duración Promedio',
    section: WIDGET_SECTIONS.TEMPO,
    description: 'Duración media de los beats'
  },

  {
    type: 'beats_position',
    title: 'Posición del Primer Beat',
    section: WIDGET_SECTIONS.TEMPO,
    description: 'Timestamp del primer beat detectado'
  },

  // Tonalidad
  {
    type: 'clave',
    title: 'Clave',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Clave musical detectada'
  },
  {
    type: 'uniformidad_notas',
    title: 'Uniformidad en las Notas',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Consistencia de las notas'
  },
  {
    type: 'estabilidad_tonal',
    title: 'Estabilidad Tonal',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Estabilidad de la tonalidad'
  },

  {
    type: 'chroma_features',
    title: 'Características Cromáticas',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Visualización circular de notas cromáticas'
  },

  // Perfil Melódico
  {
    type: 'rango_hz',
    title: 'Rango ± Hz',
    section: WIDGET_SECTIONS.PERFIL_MELODICO,
    description: 'Rango de frecuencias en Hertz'
  },
  {
    type: 'hz_medios',
    title: 'Hz Medios',
    section: WIDGET_SECTIONS.PERFIL_MELODICO,
    description: 'Frecuencia media en Hertz'
  },

  // Dinámica
  {
    type: 'db',
    title: 'Decibelios (dB)',
    section: WIDGET_SECTIONS.DINAMICA,
    description: 'Nivel de volumen en decibelios'
  },

  // Textura
  {
    type: 'caracter',
    title: 'Carácter',
    section: WIDGET_SECTIONS.TEXTURA,
    description: 'Características texturales'
  },
  {
    type: 'apertura',
    title: 'Apertura',
    section: WIDGET_SECTIONS.TEXTURA,
    description: 'Nivel de apertura sonora'
  },

  // Articulación
  {
    type: 'staccato',
    title: 'Staccato',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Nivel de articulación staccato'
  },
  {
    type: 'ataques_subitos',
    title: 'Ataques Súbitos',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Cantidad de ataques súbitos'
  },
  {
    type: 'ataques_graduales',
    title: 'Ataques Graduales',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Cantidad de ataques graduales'
  },

  {
    type: 'ratio_ataques',
    title: 'Ratio de Ataques',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Proporción entre ataques súbitos y graduales'
  }
];
