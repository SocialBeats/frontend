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
    title: 'Tono',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Tono musical detectado'
  },
  {
    type: 'uniformidad_notas',
    title: 'Consistencia Escalar',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Mide qué tanto se mantiene la melodía dentro de una escala específica'
  },
  {
    type: 'estabilidad_tonal',
    title: 'Centro Tonal',
    section: WIDGET_SECTIONS.TONALIDAD,
    description: 'Nivel de firmeza con la que se percibe la tónica o nota principal'
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
    title: 'Extensión Tonal',
    section: WIDGET_SECTIONS.PERFIL_MELODICO,
    description: 'Rango total entre la nota más grave y la más aguda'
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
    title: 'Intensidad Sonora',
    section: WIDGET_SECTIONS.DINAMICA,
    description: 'Nivel de presión sonora y potencia media (dB)'
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
    title: 'Conectividad',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Ajusta la transición y el espacio de silencio entre cada nota para crear un flujo fluido o fragmentado'
  },
  {
    type: 'ataques_subitos',
    title: 'Ataques Súbitos',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Frecuencia de notas con inicio inmediato y percusivo'
  },
  {
    type: 'ataques_graduales',
    title: 'Ataques Graduales',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Frecuencia de notas con entrada suave o creciente'
  },

  {
    type: 'ratio_ataques',
    title: 'Ratio de Ataques',
    section: WIDGET_SECTIONS.ARTICULACION,
    description: 'Proporción entre ataques súbitos y graduales'
  }
];
