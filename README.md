# 🎮 A jumping block

Este es mi primer videojuego de plataformas en 2D. Lo programé desde cero usando **JavaScript puro (Vanilla JS) y HTML5 Canvas**, sin meterle ningún motor gráfico (como Unity o Phaser) ni librerías externas. Todo el motor de físicas, colisiones y lógica lo hice a mano para entender cómo funciona un juego de verdad por dentro.

## 🚀 ¿Por qué hice este proyecto?

Creé este juego principalmente para **experimentar, romper cosas, aprender y meterle horas de vuelo a la programación**. Quería salir de la teoría y enfrentarme a los problemas reales que surgen al crear un videojuego (físicas, gravedad, bugs de colisiones, etc.). 

Sé que visualmente ahora mismo son puros cuadros y bloques de colores, pero mi meta con este experimento es dominar las bases técnicas. Con esta experiencia, el plan a futuro es ir subiendo el nivel y construir juegos cada vez más complejos y con mejor calidad.

## 🕹️ Las mecánicas que logré meterle

Aunque empezó como un ejercicio básico, me quise exigir un poco más y terminé programando varias cosas geniales:

* **Evolución del personaje:** Empiezas sin nada, pero puedes conseguir la Espada (para atacar) y las Botas (que te habilitan el doble salto en el aire).
* **Bloques con secretos:** Si saltas y golpeas ciertos bloques ocultos por abajo, descubres vidas extra.
* **Jefe final con "inteligencia":** El boss del Nivel 3 no dispara a lo loco; calcula dónde estás parado y si te le pasas por detrás, se gira y te dispara hacia la derecha o izquierda según corresponda.
* **Secuencia de escape (Modo Colapso):** Cuando por fin derrotas al jefe, el juego no termina ahí. El templo empieza a destruirse en tiempo real. Tienes que dar la vuelta y correr hacia la salida (a la izquierda) mientras caen escombros aleatorios del techo y las plataformas amarillas se caen al vacío si te quedas parado en ellas más de un tercio de segundo.
* **Checkpoints dinámicos:** Hay un punto de control a mitad de camino, pero si logras matar al jefe y mueres en el escape, reapareces justo en la arena del jefe para no tener que repetir toda la pelea.

---

## 🛠️ Con qué está hecho

* **HTML5 (Canvas):** Para renderizar y dibujar todo en la pantalla de forma dinámica.
* **CSS3:** Solo para centrar el juego en el navegador y darle un marco limpio.
* **JavaScript (ES6):** El cerebro de todo. Controla el bucle del juego (Game Loop), la lectura del teclado, las gravedades y los estados de los enemigos.

---

## 🎮 Controles para probarlo

* **Flechas Izquierda / Derecha:** Moverse de lado a lado.
* **Flecha Arriba / Barra Espaciadora:** Saltar (y doble salto si tienes las botas).
* **Teclas F o X:** Atacar (necesitas la espada).
* *Truco de desarrollador:* Si quieres probar el Nivel 3 directo sin pasar por los anteriores, presiona la tecla `P` y aparecerás ahí con la espada y las botas equipadas.

---
Creado por Pachen - 2026.
