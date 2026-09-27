# Gargantua · Simulación de Agujero Negro

Simulación relativista en tiempo real de un agujero negro supermasivo en rotación (métrica de Kerr) directamente en el navegador web mediante WebGL y shaders GLSL.

![Gargantua - Simulación de Agujero Negro](screenshot.png)

---

## 🌌 ¿Qué es Gargantua?

**Gargantua** es una experiencia interactiva que recrea la apariencia visual de un agujero negro supermasivo, inspirada en las ecuaciones de la relatividad general y en la visualización científica de la película *Interstellar*.

A través de trazado de rayos acelerado por GPU (*ray marching*), la simulación curva los fotones de luz alrededor del agujero negro para reproducir fielmente fenómenos astrofísicos extremos en tiempo real y a 60+ FPS.

---

## ✨ Características principales

- **Física relativista en tiempo real:**
  - **Métrica de Kerr y rotación (*spin*):** Modela el arrastre del espaciotiempo (*frame dragging* o efecto Lense-Thirring), achatando la sombra central en forma de «D».
  - **Lente gravitacional extrema:** La gravedad masiva desvía los rayos de luz, proyectando el disco de acreción por encima y por debajo del horizonte de sucesos.
  - **Efecto Doppler y beaming relativista:** La materia que gira hacia ti sufre un intenso corrimiento al azul y un aumento dramático de brillo, mientras que el lado que se aleja se apaga y se vuelve rojizo.
  - **Anillo de fotones:** Halo luminoso ultrafino generado por fotones que orbitan múltiples veces antes de escapar hacia el observador.
  - **Órbita Circular Estable (ISCO) y zona de caída:** Simulación de la transición del plasma entre la órbita estable y la espiral de caída libre hacia el horizonte.
  - **Fondo estelar dinámico:** Miles de estrellas procesadas con clasificación espectral real y el plano galáctico distorsionados por la gravedad.

- **Totalmente interactivo:**
  - Control de cámara 3D con órbita continua, inclinación y zoom suave.
  - 5 perspectivas cinematográficas instantáneas.
  - Panel de control para ajustar física, brillo, rotación y calidad visual en vivo.
  - Contador de fotogramas por segundo (FPS) integrado.

- **Internacionalización completa:**
  - Traducido a 45 idiomas con detección automática del idioma del sistema y guardado de preferencias.

- **Ligero y portátil:**
  - Funciona de forma 100% autónoma en un único archivo HTML (*single-file*), sin necesidad de servidores ni conexión a internet tras la descarga.

---

## 🎮 Guía de uso y controles

### Navegación de cámara
| Acción | Ratón / Teclado | Pantalla táctil |
|---|---|---|
| **Orbitar / Rotar vista** | Clic izquierdo + arrastrar | Deslizar con un dedo |
| **Zoom (acercar/alejar)** | Rueda del ratón | Pellizcar con dos dedos |

### Vistas predefinidas (barra inferior)
- **Vista Interstellar:** Perspectiva clásica cinematográfica ligeramente inclinada.
- **Sombra de Kerr:** Vista cercana ecuatorial para apreciar la asimetría del arrastre relativista.
- **Aproximación:** Órbita corta al borde del horizonte de sucesos.
- **Desde arriba:** Vista cenital que revela la geometría completa del disco de acreción.
- **Plano del disco:** Vista rasante a nivel del disco para observar la curvatura lumínica superior e inferior.

### Ajustes en vivo (panel superior derecho)
- **Calidad (Baja / Media / Alta):** Ajusta la resolución interna y el número de pasos de integración de luz para equilibrar rendimiento y detalle visual.
- **Rotación (Spin Kerr):** Modifica el parámetro de giro $a$ del agujero negro (de 0 a 0.95). Al incrementarlo, el disco penetra más cerca del centro y la sombra se deforma.
- **Brillo del disco:** Regula la emisión de radiación del plasma caliente.
- **Velocidad del disco:** Controla el ritmo de rotación del disco de acreción.
- **Anillo de fotones:** Realza el resplandor de los cruces secundarios de luz.
- **Estrellas:** Ajusta la visibilidad y densidad del fondo galáctico.
- **Zoom de lente:** Modifica el campo de visión (FOV) de la cámara.
- **Rotación automática:** Alterna la rotación orbital cinemática continua.

### Botón "¿Qué estoy viendo?"
Despliega una guía conceptual rápida que explica los principios de astrofísica y relatividad de cada elemento presente en pantalla.

---

## 🖥️ Requisitos del sistema

- Navegador web moderno con soporte para **WebGL** (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Opera o navegadores basados en Chromium).
- Tarjeta gráfica (GPU) integrada o dedicada compatible con aceleración por hardware.
- Compatible con sistemas operativos de escritorio (Linux, Windows, macOS) y dispositivos móviles (Android, iOS).

---

## 🚀 Cómo abrir la simulación

### Opción 1: Abrir el archivo compilado (Recomendado para usuarios)
Si dispones de la versión compilada (`dist/index.html`):
1. Abre el archivo `dist/index.html` directamente con tu navegador favorito (doble clic o arrastrándolo a una pestaña).
2. ¡Listo! No requiere instalación ni conexión a internet.

### Opción 2: Ejecutar desde el código fuente
Si deseas probar o modificar el proyecto en tu entorno local:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar el archivo único autónomo
npm run build
```

---

## 📚 Fundamentos físicos y referencias

- **Métrica de Kerr (1963):** Solución exacta de las ecuaciones de campo de Einstein para un agujero negro sin carga y con momento angular.
- **Bardeen, Press & Teukolsky (1972):** Fórmulas analíticas para el cálculo de órbitas circulares estables (ISCO) y radios de horizontes en agujeros negros en rotación.
- **James, von Tunzelmann, Franklin & Thorne (2015):** *Gravitational Lensing by Spinning Black Holes in Astrophysics, and in the Movie Interstellar*.
