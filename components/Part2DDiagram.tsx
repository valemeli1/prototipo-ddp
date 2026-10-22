
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface Part2DDiagramProps {
  partName: string;
  status: 'Correcto' | 'Revisar' | 'Crítico';
  height?: number;
}

type PartDiagram = {
  title: string;
  subtitle: string;
  drawing: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] ?? char);

function getPartDiagram(name: string): PartDiagram {
  const n = name.toLocaleLowerCase('es');
  const line = '#94A3B8';
  const metal = '#CBD5E1';
  const dark = '#26364B';
  const blue = '#38BDF8';

  if (n.includes('motor izquierdo') || n.includes('motor derecho')) {
    const left = n.includes('izquierdo');
    const cx = left ? 93 : 267;
    const id = left ? 'ENG 1' : 'ENG 2';

    return {
      title: `MOTOR ${left ? 'IZQUIERDO' : 'DERECHO'}`,
      subtitle: `TURBOFÁN · ${id} · VISTA LONGITUDINAL`,
      drawing: `
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stop-color="#E2E8F0"/>
            <stop offset=".35" stop-color="#64748B"/>
            <stop offset=".7" stop-color="#334155"/>
            <stop offset="1" stop-color="#94A3B8"/>
          </linearGradient>
          <radialGradient id="fan">
            <stop offset="0" stop-color="#64748B"/>
            <stop offset=".72" stop-color="#1E293B"/>
            <stop offset="1" stop-color="#0B1220"/>
          </radialGradient>
        </defs>
        <path d="M ${left ? 46 : 30} 65
                 Q 75 52 110 62 L 285 69
                 Q 315 74 315 90 Q 315 106 285 111
                 L 110 118 Q 75 128 ${left ? 46 : 30} 115 Z"
          fill="url(#metal)" stroke="${line}" stroke-width="1.5"/>
        <path d="M55 70 L278 74 L298 82 L298 98 L278 106 L55 110 Z"
          fill="${dark}" stroke="${metal}" stroke-width="1.5"/>
        ${Array.from({ length: 7 }, (_, i) => {
          const x = 137 + i * 18;
          return `<path d="M${x} 75 l10 15 -10 15"
            fill="none" stroke="#A5B4C6" stroke-width="3"/>`;
        }).join('')}
        <ellipse cx="${cx}" cy="90" rx="36" ry="39"
          fill="url(#fan)" stroke="${metal}" stroke-width="2.5"/>
        ${Array.from({ length: 18 }, (_, i) =>
          `<path d="M${cx} 90
             Q${cx + Math.cos(i * Math.PI / 9) * 13}
              ${90 + Math.sin(i * Math.PI / 9) * 13}
              ${cx + Math.cos(i * Math.PI / 9 + .3) * 30}
              ${90 + Math.sin(i * Math.PI / 9 + .3) * 30}"
             fill="none" stroke="#CBD5E1" stroke-width="3"
             stroke-linecap="round"/>`
        ).join('')}
        <circle cx="${cx}" cy="90" r="9" fill="#94A3B8"
          stroke="#E2E8F0" stroke-width="2"/>
        <path d="M115 64 L123 48 L139 48 L145 65
                 M115 116 L123 132 L139 132 L145 115"
          fill="#475569" stroke="${line}" stroke-width="2"/>
        <path d="M174 70 L180 110 M194 71 L200 109
                 M214 72 L220 108 M234 73 L240 107"
          stroke="${blue}" stroke-width="1.5" opacity=".8"/>
        <path d="M52 137 H310" stroke="#475569" stroke-dasharray="4 4"/>
        <text x="180" y="151" fill="${blue}" font-size="9"
          text-anchor="middle">ENTRADA · COMPRESOR · TURBINA · ESCAPE</text>
        <path d="M${cx} 47 V28 H${cx + 45}"/>
        <text x="${cx + 48}" y="31" fill="${metal}" font-size="9">FAN</text>
      `,
    };
  }

  if (n.includes('ala izquierda') || n.includes('ala derecha')) {
    const left = n.includes('izquierda');
    return {
      title: `ALA ${left ? 'IZQUIERDA' : 'DERECHA'}`,
      subtitle: 'ESTRUCTURA · PERFIL AERODINÁMICO · CONTROL',
      drawing: `
        <path d="${left
          ? 'M18 105 L294 28 Q310 27 315 38 L93 133 Q65 141 18 105 Z'
          : 'M42 28 L320 105 Q274 141 245 133 L20 38 Q25 27 42 28 Z'}"
          fill="#52667D" stroke="${metal}" stroke-width="2"/>
        <path d="${left
          ? 'M34 104 L292 35 M52 115 L282 42 M72 125 L266 50'
          : 'M326 104 L68 35 M308 115 L78 42 M288 125 L94 50'}"
          fill="none" stroke="#B6C7D8" stroke-width="1.5"/>
        <path d="${left
          ? 'M80 88 L232 45 L248 53 L99 101 Z'
          : 'M280 88 L128 45 L112 53 L261 101 Z'}"
          fill="#0E7490" stroke="${blue}" stroke-width="1.5"/>
        <path d="${left
          ? 'M115 78 L185 58 L195 65 L125 85 Z'
          : 'M245 78 L175 58 L165 65 L235 85 Z'}"
          fill="#075985" stroke="#7DD3FC" stroke-width="1.5"/>
        <path d="${left
          ? 'M180 59 L260 36 L272 41 L193 64 Z'
          : 'M180 59 L100 36 L88 41 L167 64 Z'}"
          fill="#64748B" stroke="${metal}" stroke-width="1.5"/>
        <path d="${left
          ? 'M150 65 L153 73 M171 59 L174 67 M192 53 L195 61'
          : 'M210 65 L207 73 M189 59 L186 67 M168 53 L165 61'}"
          stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="${left ? 148 : 212}" cy="81" r="13"
          fill="#1E293B" stroke="${blue}" stroke-width="2"/>
        <circle cx="${left ? 148 : 212}" cy="81" r="5"
          fill="#94A3B8"/>
        <path d="M180 20 V145" stroke="#64748B"
          stroke-dasharray="3 4" opacity=".7"/>
        <text x="180" y="158" fill="${blue}" font-size="9"
          text-anchor="middle">LARGUERO · TANQUE · FLAPS · ALERÓN</text>
      `,
    };
  }

  if (n.includes('fuselaje')) {
    return {
      title: 'FUSELAJE PRINCIPAL',
      subtitle: 'VISTA LATERAL · ESTRUCTURA PRESURIZADA',
      drawing: `
        <path d="M24 92 Q40 70 78 66 L283 66
          Q316 68 331 88 Q316 109 283 111
          L78 111 Q40 107 24 92 Z"
          fill="#52667D" stroke="${metal}" stroke-width="2"/>
        <path d="M35 90 Q50 77 80 76 L285 76
          Q307 78 318 88" fill="none" stroke="#E2E8F0"
          stroke-width="1.5"/>
        <path d="M35 96 Q60 104 83 102 L286 102"
          fill="none" stroke="#0F172A" stroke-width="2"/>
        ${Array.from({ length: 13 }, (_, i) =>
          `<rect x="${85 + i * 15}" y="78" width="9" height="7"
            rx="2" fill="#0B2940" stroke="${blue}" stroke-width="1"/>`
        ).join('')}
        <path d="M105 67 V110 M160 67 V110 M215 67 V110
          M270 67 V110" stroke="#CBD5E1" stroke-width="1"
          stroke-dasharray="3 3"/>
        <path d="M130 68 V107 M185 68 V107 M240 68 V107"
          stroke="#334155" stroke-width="3"/>
        <path d="M55 88 L73 77 L82 77 L82 102 L73 102 Z"
          fill="#0B2940" stroke="${blue}" stroke-width="1.5"/>
        <path d="M155 112 V128 H205 V112"
          fill="#334155" stroke="${metal}" stroke-width="1.5"/>
        <text x="180" y="143" fill="${blue}" font-size="9"
          text-anchor="middle">MAMPAROS · REVESTIMIENTO · CABINA</text>
      `,
    };
  }

  if (n.includes('cabina')) {
    return {
      title: 'CABINA DE MANDO',
      subtitle: 'COCKPIT · PARABRISAS · INSTRUMENTACIÓN',
      drawing: `
        <path d="M40 127 L40 96 Q52 48 110 34
          L253 34 Q307 47 320 96 L320 127 Z"
          fill="#52667D" stroke="${metal}" stroke-width="2"/>
        <path d="M70 93 Q85 50 119 47 L168 47
          L168 93 Z" fill="#0B2940" stroke="${blue}" stroke-width="2"/>
        <path d="M177 47 L224 47 Q266 53 289 93
          L177 93 Z" fill="#0B2940" stroke="${blue}" stroke-width="2"/>
        <path d="M171 43 V98 M67 97 H292"
          stroke="#CBD5E1" stroke-width="2"/>
        <path d="M85 83 L112 61 L145 61 L158 83
          M194 83 L207 61 L242 61 L270 83"
          fill="none" stroke="#7DD3FC" stroke-width="1.5"/>
        <rect x="88" y="103" width="185" height="20" rx="4"
          fill="#17263A" stroke="${line}" stroke-width="1.5"/>
        ${[0, 1, 2, 3, 4, 5, 6].map((i) =>
          `<rect x="${99 + i * 24}" y="108" width="17" height="10"
            rx="2" fill="#0B2940" stroke="${blue}" stroke-width="1"/>`
        ).join('')}
        <circle cx="130" cy="113" r="3" fill="#10B981"/>
        <circle cx="220" cy="113" r="3" fill="#F59E0B"/>
        <text x="180" y="147" fill="${blue}" font-size="9"
          text-anchor="middle">PANELES · VENTANAS · CONTROLES</text>
      `,
    };
  }

  if (n.includes('tren')) {
    return {
      title: 'TREN DE ATERRIZAJE',
      subtitle: 'CONJUNTO MECÁNICO · AMORTIGUACIÓN · RUEDAS',
      drawing: `
        <path d="M130 24 H230 L220 47 H140 Z"
          fill="#64748B" stroke="${metal}" stroke-width="2"/>
        <path d="M177 40 L177 79 L190 90 L190 108"
          fill="none" stroke="#E2E8F0" stroke-width="8"/>
        <path d="M193 40 L193 79 L205 90 L205 108"
          fill="none" stroke="#64748B" stroke-width="4"/>
        <rect x="169" y="43" width="30" height="34" rx="4"
          fill="#334155" stroke="${metal}" stroke-width="2"/>
        ${[0, 1, 2, 3].map(i =>
          `<path d="M174 ${48 + i * 7} H194" stroke="#CBD5E1"
            stroke-width="2"/>`
        ).join('')}
        <path d="M190 108 L130 119 M201 108 L260 119"
          stroke="${metal}" stroke-width="7" stroke-linecap="round"/>
        ${[130, 260].map(x => `
          <ellipse cx="${x}" cy="128" rx="21" ry="29"
            fill="#0B1220" stroke="#64748B" stroke-width="3"/>
          <ellipse cx="${x}" cy="128" rx="12" ry="20"
            fill="#334155" stroke="#CBD5E1" stroke-width="2"/>
          <circle cx="${x}" cy="128" r="6" fill="#94A3B8"
            stroke="#E2E8F0" stroke-width="1.5"/>
          <circle cx="${x}" cy="128" r="2" fill="#0F172A"/>
        `).join('')}
        <path d="M88 148 H302" stroke="#475569"
          stroke-dasharray="4 4"/>
        <text x="180" y="169" fill="${blue}" font-size="9"
          text-anchor="middle">CILINDRO · PUNTAL · EJES · NEUMÁTICOS</text>
      `,
    };
  }

  if (n.includes('flap') || n.includes('slat') || n.includes('alerón')) {
    return {
      title: 'SUPERFICIES DE CONTROL',
      subtitle: 'PERFIL ALAR · FLAPS · SLATS · ACTUADOR',
      drawing: `
        <path d="M22 62 Q155 42 326 62 L294 94
          Q160 79 22 92 Z"
          fill="#52667D" stroke="${metal}" stroke-width="2"/>
        <path d="M36 65 Q170 50 308 65"
          fill="none" stroke="#E2E8F0" stroke-width="2"/>
        <path d="M38 79 Q162 65 291 79 L272 91
          Q157 78 38 88 Z"
          fill="#075985" stroke="${blue}" stroke-width="1.5"/>
        <path d="M88 93 L105 115 L254 115 L270 93"
          fill="#334155" stroke="${metal}" stroke-width="2"/>
        <path d="M117 100 L117 130 L147 130 L147 100
          M222 100 L222 130 L252 130 L252 100"
          fill="#475569" stroke="#CBD5E1" stroke-width="2"/>
        <path d="M132 130 L132 143 M237 130 L237 143"
          stroke="#F59E0B" stroke-width="3"/>
        <circle cx="132" cy="144" r="5" fill="#F59E0B"/>
        <circle cx="237" cy="144" r="5" fill="#F59E0B"/>
        <text x="180" y="165" fill="${blue}" font-size="9"
          text-anchor="middle">BISAGRAS · GUÍAS · ACCIONAMIENTO</text>
      `,
    };
  }

  if (n.includes('timón') || n.includes('timon') ||
      n.includes('estabilizador')) {
    return {
      title: 'EMPENAJE Y TIMÓN',
      subtitle: 'ESTABILIZADOR VERTICAL · CONTROL DIRECCIONAL',
      drawing: `
        <path d="M65 145 L118 48 Q126 30 150 25
          L230 25 L190 145 Z"
          fill="#52667D" stroke="${metal}" stroke-width="2"/>
        <path d="M190 145 L230 25 L257 25 L222 145 Z"
          fill="#075985" stroke="${blue}" stroke-width="2"/>
        <path d="M126 49 L219 49 M111 77 L209 77
          M96 105 L199 105 M81 132 L190 132"
          stroke="#CBD5E1" stroke-width="1.2"/>
        <path d="M207 42 L229 42 M198 72 L219 72
          M189 102 L209 102 M180 132 L199 132"
          stroke="#7DD3FC" stroke-width="2"/>
        <circle cx="210" cy="88" r="4" fill="#F59E0B"/>
        <path d="M210 88 L272 88 L272 105"
          fill="none" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="278" y="116" fill="${metal}" font-size="8"
          text-anchor="middle">EJE</text>
        <text x="180" y="165" fill="${blue}" font-size="9"
          text-anchor="middle">ESTRUCTURA · ARTICULACIÓN · TIMÓN</text>
      `,
    };
  }

  if (n.includes('hidráulico') || n.includes('hidraulico')) {
    return {
      title: 'SISTEMA HIDRÁULICO',
      subtitle: 'CIRCUITO DE PRESIÓN · TUBERÍAS · ACTUADORES',
      drawing: `
        <rect x="25" y="47" width="68" height="65" rx="6"
          fill="#334155" stroke="${metal}" stroke-width="2"/>
        <circle cx="59" cy="78" r="19" fill="#0F172A"
          stroke="${blue}" stroke-width="2"/>
        <path d="M50 67 L69 78 L50 89 Z"
          fill="#38BDF8" stroke="#BAE6FD" stroke-width="1"/>
        <path d="M93 61 H143 V45 H226 V72 H292
          M93 96 H127 V128 H225 V108 H292"
          fill="none" stroke="#38BDF8" stroke-width="5"
          stroke-linejoin="round"/>
        <path d="M93 61 H143 V45 H226 V72 H292
          M93 96 H127 V128 H225 V108 H292"
          fill="none" stroke="#BAE6FD" stroke-width="1.2"
          stroke-dasharray="4 5"/>
        <rect x="152" y="35" width="54" height="21" rx="3"
          fill="#475569" stroke="${metal}" stroke-width="1.5"/>
        <rect x="151" y="118" width="55" height="21" rx="3"
          fill="#475569" stroke="${metal}" stroke-width="1.5"/>
        <path d="M292 72 V87 M285 87 H299 M292 108 V93"
          stroke="#F59E0B" stroke-width="3"/>
        <circle cx="292" cy="87" r="5" fill="#F59E0B"/>
        <text x="180" y="160" fill="${blue}" font-size="9"
          text-anchor="middle">BOMBA · LÍNEA DE PRESIÓN · RETORNO</text>
      `,
    };
  }

  if (n.includes('eléctrico') || n.includes('electrico') ||
      n.includes('batería') || n.includes('bateria')) {
    return {
      title: 'SISTEMA ELÉCTRICO',
      subtitle: 'DISTRIBUCIÓN DE ENERGÍA · BUSES · GENERACIÓN',
      drawing: `
        <rect x="22" y="56" width="68" height="61" rx="5"
          fill="#334155" stroke="${metal}" stroke-width="2"/>
        <rect x="31" y="65" width="50" height="43" rx="3"
          fill="#0F172A" stroke="${blue}" stroke-width="1.5"/>
        <path d="M42 76 H54 M48 70 V82 M60 88 H71"
          stroke="#E2E8F0" stroke-width="3"/>
        <path d="M90 86 H132 M132 86 V50 H218
          M132 86 V123 H218 M218 50 H272
          M218 123 H272"
          fill="none" stroke="#F59E0B" stroke-width="3"/>
        <rect x="150" y="36" width="55" height="28" rx="4"
          fill="#334155" stroke="#FBBF24" stroke-width="2"/>
        <rect x="150" y="109" width="55" height="28" rx="4"
          fill="#334155" stroke="#FBBF24" stroke-width="2"/>
        <rect x="272" y="70" width="54" height="32" rx="4"
          fill="#1E293B" stroke="${blue}" stroke-width="2"/>
        <circle cx="132" cy="86" r="6" fill="#FBBF24"/>
        <circle cx="218" cy="86" r="6" fill="#FBBF24"/>
        <text x="180" y="159" fill="${blue}" font-size="9"
          text-anchor="middle">BATERÍA · GENERADORES · DISTRIBUCIÓN</text>
      `,
    };
  }

  return {
    title: 'AVIÓNICA Y NAVEGACIÓN',
    subtitle: 'EQUIPOS ELECTRÓNICOS · SEÑALES · CONTROL',
    drawing: `
      <rect x="22" y="38" width="94" height="90" rx="5"
        fill="#334155" stroke="${metal}" stroke-width="2"/>
      <rect x="31" y="47" width="76" height="51" rx="3"
        fill="#071A2B" stroke="${blue}" stroke-width="1.5"/>
      <path d="M39 80 L50 68 L61 75 L73 57 L85 67 L98 54"
        fill="none" stroke="#34D399" stroke-width="2"/>
      <path d="M40 88 H97" stroke="#38BDF8" stroke-width="1"
        stroke-dasharray="3 3"/>
      <rect x="190" y="38" width="120" height="90" rx="5"
        fill="#334155" stroke="${metal}" stroke-width="2"/>
      <rect x="202" y="48" width="96" height="26" rx="3"
        fill="#0F172A" stroke="${blue}" stroke-width="1.5"/>
      <path d="M212 61 H288 M212 66 H264"
        stroke="#38BDF8" stroke-width="1.5"/>
      <circle cx="218" cy="92" r="9" fill="#0F172A"
        stroke="#34D399" stroke-width="2"/>
      <circle cx="250" cy="92" r="9" fill="#0F172A"
        stroke="#34D399" stroke-width="2"/>
      <circle cx="282" cy="92" r="9" fill="#0F172A"
        stroke="#34D399" stroke-width="2"/>
      <path d="M116 80 H153 V62 H190 M153 80 V111 H190"
        fill="none" stroke="#F59E0B" stroke-width="2"
        stroke-dasharray="4 3"/>
      <text x="180" y="151" fill="${blue}" font-size="9"
        text-anchor="middle">COMPUTADOR · SENSORES · COMUNICACIÓN</text>
    `,
  };
}

export default function Part2DDiagram({
  partName,
  status,
  height = 260,
}: Part2DDiagramProps) {
  const diagram = getPartDiagram(partName);
  const statusColor =
    status === 'Crítico' ? '#EF4444' :
    status === 'Revisar' ? '#F59E0B' : '#10B981';

  const title = escapeHtml(diagram.title);
  const subtitle = escapeHtml(diagram.subtitle);
  const safeStatus = escapeHtml(status.toUpperCase());

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
html, body {
  margin: 0; width: 100%; min-height: 100%;
  background: #0B1220; color: #E2E8F0;
  font-family: Arial, Helvetica, sans-serif;
}
body { padding: 9px; }
.card {
  width: 100%; min-height: 220px; padding: 12px 9px 8px;
  background: linear-gradient(145deg, #17263A, #0F172A);
  border: 1px solid #334155; border-radius: 13px;
  overflow: hidden;
}
.header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 7px; flex-wrap: wrap;
}
.title {
  color: #F1F5F9; font-size: 12px; font-weight: 800;
  letter-spacing: 1px;
}
.badge {
  color: ${statusColor}; border: 1px solid ${statusColor};
  background: ${statusColor}18; border-radius: 5px;
  padding: 4px 7px; font-size: 9px; font-weight: 800;
}
.subtitle {
  margin-top: 6px; color: #38BDF8; font-size: 9px;
  letter-spacing: .7px;
}
.drawing {
  width: 100%; height: auto; display: block;
  margin-top: 3px; overflow: visible;
}
.drawing path, .drawing line, .drawing polyline {
  stroke-linecap: round; stroke-linejoin: round;
}
.footer {
  border-top: 1px solid #334155; padding-top: 6px;
  display: flex; justify-content: space-between; gap: 5px;
  color: #94A3B8; font-size: 8px;
}
.dot {
  display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: ${statusColor};
  margin-right: 4px;
}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="title">${title}</div>
    <div class="badge"><span class="dot"></span>${safeStatus}</div>
  </div>
  <div class="subtitle">${subtitle}</div>
  <svg class="drawing" viewBox="0 0 360 180"
       role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M12 0 H0 V12" fill="none"
          stroke="#334155" stroke-width=".45" opacity=".65"/>
      </pattern>
      <linearGradient id="surface" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#64748B"/>
        <stop offset=".5" stop-color="#334155"/>
        <stop offset="1" stop-color="#1E293B"/>
      </linearGradient>
    </defs>
    <rect width="360" height="180" rx="5" fill="url(#grid)"/>
    <g fill="none" stroke="#64748B" stroke-width=".8" opacity=".65">
      <path d="M8 16 H24 M16 8 V24 M336 16 H352 M344 8 V24"/>
      <path d="M8 164 H24 M16 156 V172 M336 164 H352 M344 156 V172"/>
    </g>
    <g stroke="#94A3B8" stroke-width="1.2" fill="none"
       stroke-dasharray="3 4" opacity=".55">
      <path d="M180 5 V175 M5 90 H355"/>
    </g>
    <g>${diagram.drawing}</g>
  </svg>
  <div class="footer">
    <span>VISTA ESQUEMÁTICA 2D</span>
    <span>ESTADO: ${safeStatus}</span>
  </div>
</div>
</body>
</html>`;

  if (Platform.OS === 'web') {
    const IFrame = 'iframe' as any;
    return (
      <View style={[styles.container, { height }]}>
        <IFrame
          title={`Diagrama 2D: ${partName}`}
          srcDoc={html}
          style={styles.iframe}
          sandbox="allow-same-origin"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={`Diagrama de ${partName}, estado ${status}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#0B1220',
  },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: '#0B1220',
  } as any,
  webview: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
});
