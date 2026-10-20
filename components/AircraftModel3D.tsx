import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export const AIRCRAFT_MODEL_URL =
  'https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/public/models/airplane.glb';

const viewerHtml = (modelUrl: string, markersHtml: string) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #0F2942; color: #E0F2FE; font-family: Arial, sans-serif; }
  model-viewer { position:absolute; inset:0; width:100%; height:100%; background: radial-gradient(ellipse at 50% 42%, #244965 0%, #0F2942 72%); --poster-color: #0F2942; }
  #loading, #fallback { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:18px; text-align:center; background:#0F2942; }
  #loading { z-index:2; }
  #loading[hidden], #fallback[hidden] { display:none; }
  #fallback { z-index:3; }
  .hint { font-size:12px; line-height:1.5; color:#BAE6FD; max-width:320px; }
  .title { font-size:14px; font-weight:700; }
  svg { width:min(92%, 390px); max-height:230px; }
  .outline { stroke:#7DD3FC; stroke-width:2; stroke-linejoin:round; fill:#164E70; }
  .part { fill:#38BDF8; stroke:#BAE6FD; stroke-width:1.4; }
  .label { font-size:11px; fill:#E0F2FE; }
  #markers { position:absolute; inset:0; z-index:1; pointer-events:none; }
  .marker { position:absolute; max-width:46%; padding:6px 8px; border:1px solid currentColor; border-radius:8px; font-size:11px; font-weight:700; background:rgba(7,20,35,.92); box-shadow:0 2px 10px #0005; }
  .marker strong { display:block; font-size:10px; text-transform:uppercase; letter-spacing:.3px; }
  .marker .pin { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:5px; background:currentColor; }
  .marker[data-pos='leftWing'] { left:2%; top:42%; } .marker[data-pos='rightWing'] { right:2%; top:42%; }
  .marker[data-pos='engineL'] { left:3%; top:64%; } .marker[data-pos='engineR'] { right:3%; top:64%; }
  .marker[data-pos='fuselage'] { left:36%; top:24%; } .marker[data-pos='gear'] { left:37%; bottom:10%; }
  .marker[data-pos='tail'] { right:3%; top:17%; } .marker[data-pos='other'] { left:3%; top:10%; }
</style>
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.4.0/model-viewer.min.js"></script>
</head>
<body>
<model-viewer id="aircraft" src="${modelUrl}" alt="Modelo 3D de avión comercial" camera-controls auto-rotate rotation-per-second="12deg" shadow-intensity="1" exposure="1.15" environment-image="neutral" camera-orbit="35deg 68deg auto" min-camera-orbit="auto 15deg auto" max-camera-orbit="auto 115deg auto" interaction-prompt="auto" touch-action="pan-y" loading="eager"></model-viewer>
<div id="markers">${markersHtml}</div>
<div id="loading"><div class="title">Cargando modelo 3D…</div><div class="hint">Si el modelo remoto no responde, mostraremos un esquema para que la vista no quede en blanco.</div></div>
<div id="fallback" hidden>
  <div class="title">Vista esquemática del avión</div>
  <svg viewBox="0 0 360 220" role="img" aria-label="Esquema de avión con fuselaje, alas, motores y estabilizadores">
    <path class="outline" d="M180 15 C171 34 171 61 171 83 L90 130 L90 145 L172 119 L172 170 L143 191 L143 201 L180 190 L217 201 L217 191 L188 170 L188 119 L270 145 L270 130 L189 83 C189 61 189 34 180 15Z"/>
    <path class="part" d="M166 94 L132 117 L148 122 L173 111Z"/>
    <path class="part" d="M194 94 L228 117 L212 122 L187 111Z"/>
    <path class="part" d="M174 153 L151 169 L163 172 L177 164Z"/>
    <path class="part" d="M186 153 L209 169 L197 172 L183 164Z"/>
    <path class="part" d="M171 34 Q180 20 189 34 L188 48 L172 48Z"/>
    <path class="part" d="M173 177 L180 190 L187 177 L180 181Z"/>
    <text class="label" x="12" y="120">Ala izquierda</text><path stroke="#7DD3FC" d="M85 123 L135 112"/>
    <text class="label" x="242" y="120">Ala derecha</text><path stroke="#7DD3FC" d="M238 123 L225 112"/>
    <text class="label" x="12" y="70">Fuselaje</text><path stroke="#7DD3FC" d="M67 73 L170 73"/>
    <text class="label" x="232" y="178">Motores</text><path stroke="#7DD3FC" d="M229 174 L204 166"/>
    <text class="label" x="12" y="190">Estabilizadores</text><path stroke="#7DD3FC" d="M105 187 L151 184"/>
  </svg>
  <div class="hint">No se pudo descargar el archivo 3D. Revisa tu conexión y la URL del modelo. La ficha de componentes sigue disponible debajo de esta vista.</div>
</div>
<script>
(function () {
  const model = document.getElementById('aircraft');
  const loading = document.getElementById('loading');
  const fallback = document.getElementById('fallback');
  let finished = false;
  function showFallback() {
    if (finished) return;
    finished = true;
    loading.hidden = true;
    fallback.hidden = false;
    model.style.display = 'none';
    document.getElementById('markers').style.display = 'none';
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

export type AircraftMarkerPart = { name: string; status: 'Correcto' | 'Revisar' | 'Crítico' };
type Props = { height?: number; parts?: AircraftMarkerPart[] };

const markerPosition = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('ala izquierda')) return 'leftWing';
  if (n.includes('ala derecha')) return 'rightWing';
  if (n.includes('motor izquierdo')) return 'engineL';
  if (n.includes('motor derecho')) return 'engineR';
  if (n.includes('fuselaje') || n.includes('cabina')) return 'fuselage';
  if (n.includes('tren') || n.includes('freno') || n.includes('rueda')) return 'gear';
  if (n.includes('timón') || n.includes('elevador') || n.includes('estabilizador')) return 'tail';
  return 'other';
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch] as string));

export default function AircraftModel3D({ height = 290, parts = [] }: Props) {
  const flaggedParts = parts.filter((part) => part.status !== 'Correcto');
  const markersHtml = flaggedParts.map((part) => {
    const color = part.status === 'Crítico' ? '#F87171' : '#FDBA74';
    return '<div class="marker" data-pos="' + markerPosition(part.name) +
      '" style="color:' + color + '"><strong><span class="pin"></span>' +
      escapeHtml(part.status) + '</strong>' + escapeHtml(part.name) + '</div>';
  }).join('');
  const html = viewerHtml(AIRCRAFT_MODEL_URL, markersHtml);

  if (Platform.OS === 'web') {
    const IFrame = 'iframe' as any;
    return (
      <View style={[styles.frame, { height }]}>
        <IFrame
          title="Modelo 3D interactivo de aeronave"
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin"
          style={{ width: '100%', height: '100%', border: 0, backgroundColor: '#0F2942' }}
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
            <Text style={styles.loadingText}>Abriendo visor 3D…</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', borderRadius: 13, backgroundColor: '#0F2942' },
  webview: { backgroundColor: '#0F2942', opacity: 0.99 },
  webviewContainer: { backgroundColor: '#0F2942' },
  loading: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F2942' },
  loadingText: { color: '#E0F2FE', fontSize: 12, fontWeight: '700' },
});