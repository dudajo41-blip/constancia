# Constancia

App personal de entrenamiento (calistenia) y contador de proteína. Funciona sin internet una vez instalada. Todos los datos quedan en el teléfono.

## Qué incluye

- **Hoy:** fase y semana, sesión del día (A sábado y B domingo en el parque, C en casa entre semana), última vez de cada ejercicio, meta sugerida y hábitos. Sin deuda por sesiones perdidas.
- **Modo parque:** un ejercicio a la vez, cronómetro de descanso por ejercicio (ampliable), cronómetro para planchas, registro de RIR y técnica al terminar cada ejercicio, sustituir ejercicio, deshacer y borrador recuperable.
- **Progresión:** doble progresión condicionada. La meta solo sube si la última sesión tuvo buena técnica y RIR suficiente; se sube de variante tras dos sesiones seguidas en el techo del rango. Las sesiones de la rutina nueva llevan `rv:2`; el historial anterior se conserva.
- **Fases:** Readaptación, Construcción y Desarrollo, que cambias tú según técnica y recuperación. Semana suave opcional (sin descarga obligatoria).
- **Proteína:** contador diario contra la meta (1,6 g por kilo), por comida del día, alimentos comunes, frecuentes y gráfico de 7 días.
- **Comida:** registro de lo que comes y observaciones semanales (no son diagnósticos).
- **Progreso:** metas, sesiones y series por semana, evolución por ejercicio, tendencia de peso, test, mejores series.
- **Respaldo:** descargar y restaurar; antes de restaurar se valida el archivo y se guarda una copia de los datos actuales.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La app |
| `sw.js` | Guarda la app en el teléfono para que abra sin internet |
| `manifest.webmanifest`, `icon-192.png`, `icon-512.png` | Permiten instalarla como app |

## Publicarla (una sola vez)

Una app instalable necesita una dirección https. La opción más simple es GitHub Pages:

1. Crea un repositorio **público** llamado `constancia` y sube estos archivos a la rama `main`. Es público porque en cuentas gratis GitHub Pages no funciona con repos privados. No expone datos tuyos, porque tus datos viven en el teléfono.
2. En el repositorio: Settings, Pages, Deploy from a branch, rama `main`, carpeta `/ (root)`.
3. Espera 1 o 2 minutos. La dirección queda como `https://TU-USUARIO.github.io/constancia/`.

## Instalarla en el teléfono

1. Abre la dirección en el teléfono, con internet.
2. Android (Chrome): menú de tres puntos, "Instalar app". iPhone (Safari): compartir, "Agregar a inicio".
3. Ábrela una vez desde el ícono. Desde ahí funciona sin señal.

## Actualizar la app

Cuando cambies cualquier archivo, sube el número de `VERSION` en `sw.js` (por ejemplo `constancia-v4`). Si no, el teléfono seguirá usando la copia guardada.

## Sobre los datos

- Se guardan en el almacenamiento del navegador del teléfono. Si desinstalas la app o borras los datos del navegador, se pierden.
- Descarga un respaldo desde Plan, Respaldo, de vez en cuando.

## Fuentes de los datos de proteína

Valores aproximados por porción. Varían por marca y preparación.

- Meta de 1,6 g/kg/día: Morton et al., Br J Sports Med 2018. https://pubmed.ncbi.nlm.nih.gov/28698222/
- Pollo, atún, huevo, lácteos: British Nutrition Foundation. https://www.nutrition.org.uk/media/yh2botxi/protein-in-the-diet_resource.pdf
- Porciones estándar: https://pressbooks.library.vcu.edu/biol217vcu/chapter/6c-protein-in-foods-and-dietary-recommendations/
- Legumbres y carnes cocidas: https://www.todaysdietitian.com/pdf/webinars/ProteinContentofFoods.pdf
