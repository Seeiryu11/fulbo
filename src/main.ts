// DEMO jugable: interfaz mínima sobre el núcleo + módulos de demo (src/demo). No es la interfaz final.
import './estilo.css';
import {
  aplicarEfectos, almacenLocal, avanceRapido, cargar, crearPartida, formatear, guardar, irAlPartido, jugarPartidoActual, type Partida,
} from './nucleo';
import { MOVIDAS, ordenarTabla, PROPIO, proximo, registroDemo } from './demo/demo';
import { montarEscena } from './escena3d/escena';

const registro = registroDemo();
const almacen = almacenLocal();
const CLAVE = 'fulbo:demo';
let p: Partida | null = cargar(almacen, CLAVE);
const raiz = document.getElementById('app')!;
raiz.innerHTML = '<div id="escena"></div><div id="ui"></div>';
montarEscena(document.getElementById('escena')!);
const app = document.getElementById('ui')!;
let panel: 'tabla' | 'diario' | null = null;
const fmt = (n: number) => `AU ${(n / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function nuevaPartida(nombre: string) {
  p = crearPartida(registro, { semilla: Math.floor(Math.random() * 2 ** 31), temporada: 2026, creacion: { nombre } });
  persistir();
}
function persistir() { if (p) guardar(p, almacen, CLAVE); render(); }

function jugar(cantidad = 1) {
  if (!p) return;
  if (cantidad > 1) {
    p = avanceRapido(p, registro, { maxPartidos: cantidad, importanciaQueFrena: 3 }).partida;
    return persistir();
  }
  const ida = irAlPartido(p, registro);
  p = ida.partida;
  if (!ida.interrupcion && p.tiempo.fase === 'previa') p = jugarPartidoActual(p, registro).partida;
  persistir();
}

function decidir(opcion: number) {
  if (!p) return;
  p = aplicarEfectos(p, [{ origen: 'ui', tipo: 'accion', modulo: 'movidas', accion: { tipo: 'decidir', opcion } }], registro);
  persistir();
}

function render() {
  if (!p) {
    app.innerHTML = `
      <div class="crear panel">
        <h1 class="titulo">FULBO</h1>
        <p>Sos el dueño de un club que arranca en la <b>B Nacional</b>. Jugá la temporada, tomá decisiones en el Despacho y buscá el ascenso.</p>
        <label>Nombre de tu club <input id="nombre" value="Atlético Villa Ferro" maxlength="32"></label>
        <button class="btn verde grande" id="empezar">¡Arrancar!</button>
        <p class="chico">Demo temprana · los datos se guardan en este navegador</p>
      </div>`;
    document.getElementById('empezar')!.onclick = () => nuevaPartida((document.getElementById('nombre') as HTMLInputElement).value.trim() || 'Atlético Villa Ferro');
    return;
  }
  const { liga, club, economia, movidas, tiempo } = p;
  const tabla = ordenarTabla(liga.equipos);
  const pos = tabla.findIndex((e) => e.id === PROPIO) + 1;
  const prox = proximo(p);
  const rivalProx = prox && liga.fechas.flat().find((x) => x.id === prox.partido);
  const nombreDe = (id: string) => liga.equipos.find((e) => e.id === id)!.nombre;
  const textoProx = rivalProx ? `${prox!.local ? 'vs' : 'en cancha de'} ${esc(nombreDe(prox!.local ? rivalProx.visitante : rivalProx.local))} · sábado, semana ${prox!.cuando.semana}` : 'Receso de fin de temporada';
  const movida = MOVIDAS.find((m) => m.id === movidas.pendiente);
  const noticias = [...p.noticias].reverse().slice(0, 25);
  const ultimo = noticias[0];

  app.innerHTML = `
    <header class="hud">
      <div class="pan club"><div class="escudo">${esc(club.nombre.slice(0, 2).toUpperCase())}</div>
        <div><div class="nombre">${esc(club.nombre)}</div><div class="sub">B Nacional · ${pos}.º · Temporada ${tiempo.hoy.temporada}</div></div></div>
      <div class="pan"><span class="ico">💰</span><span class="monto ${economia.caja < 0 ? 'rojo' : ''}">${fmt(economia.caja)}</span></div>
      <div class="pan"><span class="ico">⭐</span><span class="monto">${club.fama.toLocaleString('es-AR')}</span></div>
      <div class="pan"><span class="ico">💪</span><span class="monto">${club.moral}</span><span class="sub">moral</span></div>
      <div class="pan fecha"><div>📅 ${formatear(tiempo.hoy)}</div><div class="sub">Próximo: ${textoProx}</div></div>
    </header>
    <div class="toast">${ultimo ? `<b>${esc(ultimo.titulo)}</b>${ultimo.texto ? `<br><span>${esc(ultimo.texto)}</span>` : ''}` : 'Arranca la pretemporada. Tocá JUGAR.'}</div>
    ${panel === 'tabla' ? `
    <section class="flotante panel">
      <button class="cerrar" data-panel="">✕</button>
      <h2>B Nacional</h2>
      <table class="tabla"><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr></thead><tbody>
      ${tabla.map((e, i) => `<tr class="${e.id === PROPIO ? 'propio' : ''} ${i < 1 ? 'asc' : i < 2 ? 'rep' : i >= 18 ? 'desc' : ''}"><td>${i + 1}</td><td>${esc(e.nombre)}</td><td>${e.pj}</td><td>${e.g}</td><td>${e.e}</td><td>${e.p}</td><td>${e.gf - e.gc}</td><td><b>${e.pts}</b></td></tr>`).join('')}
      </tbody></table>
      <p class="chico">🟩 asciende · 🟨 repechaje · 🟥 desciende</p>
    </section>` : ''}
    ${panel === 'diario' ? `
    <section class="flotante panel">
      <button class="cerrar" data-panel="">✕</button>
      <h2>📰 Diario</h2>
      <ul class="noticias">${noticias.map((n) => `<li class="imp${n.importancia}"><b>${esc(n.titulo)}</b>${n.texto ? `<br><span>${esc(n.texto)}</span>` : ''}<em>S${n.cuando.semana}</em></li>`).join('') || '<li>Todavía no pasó nada. Tocá JUGAR.</li>'}</ul>
    </section>` : ''}
    <button class="play" id="jugar" ${movida ? 'disabled' : ''}>⚽<b>JUGAR</b></button>
    <nav class="nav">
      <button class="tab ${panel === 'tabla' ? 'on' : ''}" data-panel="tabla"><span class="e">📅</span>Tabla</button>
      <button class="tab ${panel === 'diario' ? 'on' : ''}" data-panel="diario"><span class="e">📰</span>Diario</button>
      <button class="tab" id="rapido" ${movida ? 'disabled' : ''}><span class="e">⏩</span>Simular 5</button>
      <button class="tab" id="reiniciar"><span class="e">🔄</span>Nueva</button>
    </nav>
    ${movida ? `
    <div class="velo"><div class="modal panel">
      <div class="etiqueta">📣 Movida en el Despacho</div>
      <h2>${esc(movida.titulo)}</h2><p>${esc(movida.texto)}</p>
      <div class="opciones">${movida.opciones.map((o, i) => `<button class="btn azul" data-op="${i}">${esc(o.texto)}</button>`).join('')}</div>
    </div></div>` : ''}`;

  document.getElementById('jugar')!.onclick = () => jugar(1);
  document.getElementById('rapido')!.onclick = () => jugar(5);
  document.getElementById('reiniciar')!.onclick = () => { if (confirm('¿Empezar de cero? Se pierde la partida actual.')) { almacen.borrar(CLAVE); p = null; render(); } };
  document.querySelectorAll<HTMLButtonElement>('[data-op]').forEach((b) => (b.onclick = () => decidir(Number(b.dataset.op))));
  document.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((b) => (b.onclick = () => { const v = b.dataset.panel as typeof panel | ''; panel = !v || panel === v ? null : v; render(); }));
}

render();
