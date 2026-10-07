# Guía: seguir FULBO desde otra compu

Repo: https://github.com/Seeiryu11/fulbo

## Lo importante primero

**GitHub NO guarda solo.** Los cambios quedan en la compu donde se hicieron hasta que se hace **commit + push**.
Antes de irte de una compu, pedile a Claude: **"commiteá y pusheá todo"**.

**La conversación con Claude no viaja.** Lo que sí viaja es el proyecto, y en especial `CLAUDE.md`, que tiene todas las decisiones, el estado y el próximo paso. Una sesión nueva lo lee sola y sigue desde ahí.

---

## 1. Primera vez en una compu nueva (una sola vez)

1. Instalar git y Node.js. En una terminal:
   ```bash
   winget install Git.Git
   winget install OpenJS.NodeJS.LTS
   ```
   Cerrá y volvé a abrir la terminal después.
2. Ir a la carpeta donde quieras tener el proyecto (por ejemplo, Documentos):
   ```bash
   cd ~/Documents
   ```
3. Bajar el proyecto (crea la carpeta `fulbo` con todo adentro):
   ```bash
   git clone https://github.com/Seeiryu11/fulbo.git
   ```
   **No copies la carpeta vieja a mano**: usá solo esta.
4. Decirle a git quién sos:
   ```bash
   git config --global user.name "Seeiryu11"
   git config --global user.email "320675400+Seeiryu11@users.noreply.github.com"
   ```
5. Abrir la carpeta `fulbo` en Claude Code (app de escritorio → Code → elegir la carpeta).
6. La primera vez que se suban cambios, Windows abre una ventana para iniciar sesión en GitHub: aceptala.

Opcional: `winget install Gyan.FFmpeg` (solo para sacar fotogramas de videos). Los videos `.mov` de referencia no están en GitHub; no hacen falta.

---

## 2. Cómo retomar la sesión con Claude

En la sesión nueva, escribí algo así como primer mensaje:

> Seguimos con FULBO. Leé CLAUDE.md, steering/roadmap.md y specs/nucleo/. Hacé git pull, decime en qué estado quedó todo y cuál es el próximo paso.

Claude va a encontrar:
- `CLAUDE.md`: decisiones tomadas (no se vuelven a discutir), estado actual y próximo paso.
- `steering/roadmap.md`: las fases y en cuál estamos.
- `specs/`: todo lo especificado, módulo por módulo.
- `.claude/agents/`: los 6 agentes del proyecto (club, mercado, liga, partido, movidas, economía) y `steering/agentes.md` con sus reglas comunes.

### Usar los agentes

Pedíselo a Claude en lenguaje normal, por ejemplo:
> Usá el agente liga para hacer el design.md de la liga.
> Lanzá en paralelo los agentes club, mercado y movidas para que armen sus design.md.

Cada agente trabaja solo en su módulo, respeta el núcleo y al terminar deja un informe; Claude (el coordinador) revisa, te consulta lo que haga falta y commitea.

---

## 3. Cada vez que te sentás a trabajar

**Al empezar** (en la carpeta `fulbo`): `git pull`, o pedile a Claude *"hacé git pull"*.

**Al terminar**: pedile a Claude *"commiteá y pusheá todo"*, o a mano:
```bash
git add -A
git commit -m "lo que hice"
git push
```

---

## 4. Si algo sale mal

- **`git pull` dice que hay conflictos**: se cambió lo mismo en las dos compus sin subir antes. Pedile a Claude: *"resolvé los conflictos del pull"*.
- **`git push` es rechazado** ("rejected" / "fetch first"): alguien subió algo antes. `git pull` y después `git push`.
- **¿Subí todo?**: `git status`. Si dice "nothing to commit, working tree clean" y "up to date with 'origin/main'", está todo subido.

---

## 5. Para tus amigos

- Ver y bajar: cualquiera con el link (el repo es público).
- Para que puedan **subir** cambios: https://github.com/Seeiryu11/fulbo/settings/access → **Add people** → su usuario de GitHub. Siguen la sección 1 con su propio nombre y mail en el paso 4.
