# Constancia

App personal de entrenamiento (calistenia) y contador de proteína. Funciona sin internet una vez instalada. Todos los datos quedan en el teléfono.

## Qué incluye

- **Hoy:** sesión del día (A sábado, B domingo, C entre semana), última vez de cada ejercicio, meta sugerida y hábitos.
- **Modo parque:** un ejercicio a la vez, botones grandes, cronómetro de descanso con sonido y vibración, la pantalla no se apaga.
- **Progresión:** meta de hoy = última vez + 1 (doble progresión). Escalera de niveles en dominadas, fondos y remo.
- **Ciclo de 5 semanas:** 4 de progresión y 1 suave (una serie menos por ejercicio).
- **Proteína:** contador diario contra la meta (1,6 g por kilo), alimentos comunes y gráfico de 7 días.
- **Progreso:** sesiones por semana, evolución por ejercicio, test de partida, mejores series.
- **Respaldo:** descargar y restaurar los datos en un archivo.

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
