import './MetricsWidgets.css';

const ChromaWidget = ({ title, chromaFeatures }) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col justify-center h-full">
        <div className="chroma-bars-vertical">
          {notes.map((note, index) => {
            const value = chromaFeatures[note] || 0;
            const barWidth = Math.max(value * 100, 5); // Ancho variable en %
            const intensity = value * 0.7 + 0.3; // 0.3 a 1.0

            return (
              <div key={note} className="chroma-row">
                <span className="chroma-row-label">{note}</span>
                <div className="chroma-row-track">
                  <div
                    className="chroma-row-bar"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(to right, 
                        rgba(99, 102, 241, ${intensity}), 
                        rgba(139, 92, 246, ${intensity * 1.2})
                      )`,
                      boxShadow: `0 0 ${value * 15}px rgba(139, 92, 246, ${value * 0.8})`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChromaWidget;