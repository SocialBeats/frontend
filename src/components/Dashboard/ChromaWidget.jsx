import './BaseWidget.css';
import './ChromaWidget.css';

const ChromaWidget = ({ title, chromaFeatures = {} }) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normalizar keys: aceptar both "C" and "chroma_C"
  const getValue = (note) => {
    if (!chromaFeatures) return 0;
    return (
      chromaFeatures[note] ??
      chromaFeatures[`chroma_${note}`] ??
      chromaFeatures[note.toUpperCase()] ??
      chromaFeatures[`chroma_${note.toUpperCase()}`] ??
      0
    );
  };

  const rows = notes.map((note) => {
    const value = Number(getValue(note)) || 0;
    const percent = Math.round(value * 100);
    return { note, value, percent };
  });

  return (
    <div className="widget-base chroma-widget">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>

      <div className="chroma-grid">
        {rows.map(({ note, value, percent }) => {
          const barWidth = Math.max(Math.round(value * 100), 4);
          const intensity = Math.min(1, Math.max(0.2, value));
          const valueLabel = value.toFixed(2);
          return (
            <div className="chroma-item" key={note}>
              <div className="chroma-item-left">
                <span className="chroma-note">{note}</span>
              </div>
              <div className="chroma-item-right">
                <div className="chroma-row-track">
                  <div
                    className="chroma-row-bar"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, rgba(99,102,241,${0.6 + intensity * 0.4}) 0%, rgba(139,92,246,${0.7 + intensity * 0.3}) 100%)`,
                      boxShadow: `0 0 ${Math.round(value * 22)}px rgba(139,92,246,${value * 0.95})`
                    }}
                  />
                </div>
                <div className="chroma-percent">{valueLabel}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChromaWidget;