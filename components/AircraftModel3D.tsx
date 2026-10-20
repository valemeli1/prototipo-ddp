
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export const AIRCRAFT_MODEL_URL =
  'https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/public/models/airplane.glb';

export type AircraftMarkerPart = {
  name: string;
  status: 'Correcto' | 'Revisar' | 'Crítico';
};

type Props = {
  height?: number;
  parts?: AircraftMarkerPart[];
};

const markerPosition = (name: string) => {
  const n = name.toLowerCase();

  if (n.includes('ala izquierda')) return 'leftWing';
  if (n.includes('ala derecha')) return 'rightWing';
  if (n.includes('motor izquierdo')) return 'engineL';
  if (n.includes('motor derecho')) return 'engineR';
  if (n.includes('fuselaje') || n.includes('cabina')) return 'fuselage';
  if (n.includes('tren') || n.includes('freno') || n.includes('rueda')) return 'gear';
  if (
    n.includes('timón') ||
    n.includes('elevador') ||
    n.includes('estabilizador')
  ) return 'tail';

  return 'other';
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch] as string));

const viewerHtml = (modelUrl: string, markersHtml: string) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
html, body {
  margin: 0; width: 100%; height: 100%; overflow: hidden;
  background: #0F2942; color: #E0F2FE;
  font-family: Arial, sans-serif;
}
model-viewer {
  position: absolute; inset: 0; width: 100%; height: 100%;
  background: radial-gradient(ellipse at center, #244965, #0F2942);
}
#markers {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
}
.marker {
  position: absolute; max-width: 47%; padding: 7px 9px;
  border: 1px solid currentColor; border-radius: 8px;
  font-size: 11px; font-weight: 700;
  background: rgba(7,20,35,.94);
  box-shadow: 0 2px 10px #0005;
}
.marker strong {
  display: block; font-size: 10px; text-transform: uppercase;
}
.pin {
  display: inline-block; width: 7px; height: 7px;
  border-radius: 50%; margin-right: 5px; background: currentColor;
}
[data-pos="leftWing"] { left: 2%; top: 40%; }
[data-pos="rightWing"] { right: 2%; top: 40%; }
[data-pos="engineL"] { left: 2%; top: 65%; }
[data-pos="engineR"] { right: 2%; top: 65%; }
[data-pos="fuselage"] { left: 35%; top: 23%; }
[data-pos="gear"] { left: 35%; bottom: 8%; }
[data-pos="tail"] { right: 2%; top: 15%; }
[data-pos="other"] { left: 2%; top: 10%; }

#loading, #fallback {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 20px; text-align: center;
  background: #0F2942;
}
#loading[hidden], #fallback[hidden] { display: none; }
.title { font-size: 15px; font-weight: 700; }
.hint { color: #BAE6FD; font-size: 12px; line-height: 1.5; }
svg { width: 95%; max-height: 230px; }
.outline { fill: #164E70; stroke: #7DD3FC; stroke-width: 2; }
.part { fill: #38BDF8; stroke: #BAE6FD; stroke-width: 1.4; }
.label { font-size: 11px; fill: #E0F2FE; }
</style>
<script type="module"
src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.4.0/model-viewer.min.js"></script>
</head>
<body>
<model-viewer id="aircraft"
  src="${modelUrl}"
  alt="Modelo 3D de avión comercial"
  camera-controls auto-rotate
  rotation-per-second="12deg"
  shadow-intensity="1"
  exposure="1.15"
  environment-image="neutral"
  camera-orbit="35deg 68deg auto"
  interaction-prompt="auto"
  loading="eager">
</model-viewer>

<div id="markers">${markersHtml}</div>

<div id="loading">
  <div class="title">Cargando modelo 3D...</div>
  <div class="hint">Si no se puede cargar el modelo, aparecerá una vista alternativa.</div>
</div>

<div id="fallback" hidden>
  <div class="title">Vista esquemática del avión</div>
  <svg viewBox="0 0 360 220" role="img" aria-label="Esquema de avión">
    <path class="outline"
      d="M180 15 C171 34 171 61 171 83 L90 130 L90 145
      L172 119 L172 170 L143 191 L143 201 L180 190
      L217 201 L217 191 L188 170 L188 119 L270 145
      L270 130 L189 83 C189 61 189 34 180 15Z"/>
    <path class="part" d="M166 94 L132 117 L148 122 L173 111Z"/>
    <path class="part" d="M194 94 L228 117 L212 122 L187 111Z"/>
    <text class="label" x="12" y="120">Ala izquierda</text>
    <text class="label" x="242" y="120">Ala derecha</text>
    <text class="label" x="12" y="70">Fuselaje</text>
    <text class="label" x="232" y="178">Motores</text>
  </svg>
  <div class="hint">
    No se pudo descargar el modelo 3D. Comprueba la conexión y la URL del modelo.
  </div>
</div>

<script>
(function () {
  const model = document.getElementById('aircraft');
  const loading = document.getElementById('loading');
  const fallback = document.getElementById('fallback');
  const markers = document.getElementById('markers');
  let finished = false;

  function showFallback() {
    if (finished) return;
    finished = true;
    loading.hidden = true;
    fallback.hidden = false;
    model.style.display = 'none';
    markers.style.display = 'none';
  }

  model.addEventListener('load', function () {
    finished = true;
    loading.hidden = true;
  });

  model.addEventListener('error', showFallback);

  setTimeout(showFallback, 15000);
})();
</script>
</body>
</html>`;

export default function AircraftModel3D({
  height = 290,
  parts = [],
}: Props) {
  const flaggedParts = parts.filter(
    (part) => part.status !== 'Correcto'
  );

  const markersHtml = flaggedParts.map((part) => {
    const color =
      part.status === 'Crítico' ? '#F87171' : '#FDBA74';

    return (
      '<div class="marker" data-pos="' +
      markerPosition(part.name) +
      '" style="color:' + color + '">' +
      '<strong><span class="pin"></span>' +
      escapeHtml(part.status) +
      '</strong>' +
      escapeHtml(part.name) +
      '</div>'
    );
  }).join('');

  // Corrección: se pasan los dos argumentos requeridos.
  const html = viewerHtml(AIRCRAFT_MODEL_URL, markersHtml);

  if (Platform.OS === 'web') {
    const IFrame = 'iframe' as any;

    return (
      <View style={[styles.frame, { height }]}>
        <IFrame
          title="Modelo 3D interactivo de aeronave"
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            backgroundColor: '#0F2942',
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.frame, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>
              Abriendo visor 3D...
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 13,
    backgroundColor: '#0F2942',
  },
  webview: {
    backgroundColor: '#0F2942',
    opacity: 0.99,
  },
  webviewContainer: {
    backgroundColor: '#0F2942',
  },
  loading: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2942',
  },
  loadingText: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '700',
  },
});
