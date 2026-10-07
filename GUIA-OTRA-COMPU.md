# Guía: seguir FULBO desde otra compu

Repo: https://github.com/Seeiryu11/fulbo

## Lo importante primero

**GitHub NO guarda solo.** Los cambios quedan en la compu donde se hicieron hasta que se hace **commit + push**.
Antes de irte de una compu, pedile a Claude:

> "commiteá y pusheá todo"

(o hacelo vos con los comandos de abajo). Si no, la otra compu no va a ver esos cambios.

---

## 1. Primera vez en una compu nueva (se hace una sola vez)

1. Instalar git (si no lo tiene). En una terminal:
   ```bash
   winget install Git.Git
   ```
   Cerrá y volvé a abrir la terminal después de instalarlo.
2. Ir a la carpeta donde quieras tener el proyecto (por ejemplo, Documentos):
   ```bash
   cd ~/Documents
   ```
3. Bajar el proyecto:
   ```bash
   git clone https://github.com/Seeiryu11/fulbo.git
   ```
   Esto crea la carpeta `fulbo` con todo adentro. **No copies la carpeta vieja a mano**: usá solo esta.
4. Decirle a git quién sos (una vez por compu):
   ```bash
   git config --global user.name "Seeiryu11"
   git config --global user.email "320675400+Seeiryu11@users.noreply.github.com"
   ```
5. Abrir la carpeta `fulbo` en Claude Code. La sesión lee `CLAUDE.md` y ya sabe todo el contexto.
6. La primera vez que subas cambios, Windows te va a abrir una ventana para iniciar sesión en GitHub: aceptala.

Opcional, para cuando programemos o haya que sacar fotogramas:
```bash
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
```

Los videos `.mov` de referencia **no están en GitHub** (pesan demasiado). Si los querés, copialos aparte a `referencias/videos/`. No hacen falta para seguir.

---

## 2. Cada vez que te sentás a trabajar

**Al empezar** (en la carpeta `fulbo`), bajá lo último:
```bash
git pull
```
o pedile a Claude: *"hacé git pull"*.

**Al terminar**, subí lo que hiciste:
```bash
git add -A
git commit -m "lo que hice"
git push
```
o pedile a Claude: *"commiteá y pusheá todo"*.

---

## 3. Si algo sale mal

- **`git pull` dice que hay conflictos**: pasa si se cambió el mismo archivo en las dos compus sin subir antes. Pedile a Claude: *"resolvé los conflictos del pull"*.
- **`git push` es rechazado** ("fetch first" / "rejected"): alguien subió algo antes. Hacé `git pull` y después `git push` de nuevo.
- **No sé si subí todo**: `git status`. Si dice "nothing to commit, working tree clean" y "up to date with origin/main", está todo subido.

---

## 4. Para tus amigos

- Ver y bajar el proyecto: cualquiera con el link (es público).
- Para que puedan **subir** cambios: agregalos en https://github.com/Seeiryu11/fulbo/settings/access → **Add people** → su usuario de GitHub. Ellos siguen la sección 1 de esta guía (con su propio nombre y mail en el paso 4).
