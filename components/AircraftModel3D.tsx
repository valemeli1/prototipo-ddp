import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export const AIRCRAFT_MODEL_URL =
  'https://raw.githubusercontent.com/bilawalsidhu/gods-eye-view/main/public/models/airplane.glb';

const viewerHtml = (modelUrl: string) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #0F2942; font-family: Arial, sans-serif; }
  model-viewer { width: 100%; height: 100%; min-height: 300px; background: radial-gradient(ellipse at 50% 42%, #244965 0%, #0F2942 72%); --poster-color: #0F2942; }
  .loading { position: absolute; inset: 0; display: grid; place-items: center; color: #E0F2FE; font-size: 13px; pointer-events: none; }
  model-viewer[loaded] + .loading { display: none; }
</style>
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.4.0/model-viewer.min.js"></script>
</head>
<body>
<model-viewer src="${modelUrl}" alt="Modelo 3D de avión comercial" camera-controls auto-rotate rotation-per-second="12deg" shadow-intensity="1" exposure="1.15" environment-image="neutral" camera-orbit="35deg 68deg auto" min-camera-orbit="auto 15deg auto" max-camera-orbit="auto 115deg auto" interaction-prompt="auto" touch-action="pan-y" loading="eager"></model-viewer>
<div class="loading">Cargando modelo 3D del avión…</div>
</body>
</html>`;

type Props = { height?: number };

export default function AircraftModel3D({ height = 290 }: Props) {
  const html = viewerHtml(AIRCRAFT_MODEL_URL);

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
            <Text style={styles.loadingText}>Cargando modelo 3D del avión…</Text>
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
