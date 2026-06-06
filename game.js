const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const livesElement = document.getElementById("lives");

// --- CONFIGURACIÓN GLOBAL DEL JUEGO ---
const GRAVEDAD = 0.5;
const FRICCION = 0.8;
let vidas = 3;
let juegoTerminado = false;
let nivelActual = 0; // 0 = Nivel 1, 1 = Nivel 2, 2 = Nivel 3

// --- CÁMARA (SCROLLING) ---
let camaraX = 0;
const ANCHO_NIVEL = 3600; 

// --- PODERES / ITEMS ADQUIRIDOS ---
let tieneAtaque = false;
let tieneDobleSalto = false;

// --- ESTADO DE ATAQUE JUGADOR ---
let estaAtacando = false;
let temporizadorAtaque = 0;

// --- SISTEMA DE CHECKPOINT (Nivel 3) ---
let checkpointActivado = false;
let checkpointX = 1800;
let checkpointY = 250;

// --- SECUENCIA DE ESCAPE (NIVEL 3) ---
let modoEscapeActivo = false;
let escombros = [];
let temporizadorEscombros = 0;
let letreroParpadeo = 0;

// --- CONFIGURACIÓN DEL JUGADOR ---
const jugador = {
    x: 100,
    y: 200,
    ancho: 30,
    alto: 40,
    velocidadX: 0,
    velocidadY: 0,
    velocidadMovimiento: 5,
    fuerzaSalto: 12,
    enElSuelo: false,
    saltosRealizados: 0, 
    direccion: 1, 
    color: "#e63946"
};

// --- CONFIGURACIÓN DE MINI JEFE (Nivel 2) ---
const miniJefe = {
    x: 1350, y: 310, ancho: 50, alto: 60, vida: 5, velocidadX: 2,
    limiteIzquierda: 1100, limiteDerecha: 1550, vivo: true, invulnerable: 0 
};

// --- CONFIGURACIÓN DEL JEFE FINAL ---
const jefeFinal = {
    x: 3200,
    y: 250, 
    ancho: 80,
    alto: 120,
    vida: 8,
    maxVida: 8,
    vivo: true,
    invulnerable: 0,
    velocidadX: -2, 
    limiteIzquierda: 2900, 
    limiteDerecha: 3450,
    cooldownDisparo: 0 
};

// Arreglos dinámicos por nivel
let ataquesFuego = [];
let bloquesSecretos = [];
let plataformas = []; 
let puas = []; 
let items = []; 
let enemigos = [];

// --- ESTRUCTURAS FIJAS DE LOS NIVELES ---
const datosNiveles = [
    {
        nombre: "Nivel 1", colorCielo: "#3a86ff",
        plataformas: [
            { x: 0, y: 370, ancho: 700, alto: 30, color: "#2a9d8f" },
            { x: 300, y: 260, ancho: 120, alto: 20, color: "#e9c46a" },
            { x: 850, y: 370, ancho: 1000, alto: 30, color: "#2a9d8f" },
            { x: 1000, y: 250, ancho: 150, alto: 20, color: "#e9c46a" },
            { x: 2000, y: 370, ancho: 1600, alto: 30, color: "#2a9d8f" },
            { x: 3500, y: 170, ancho: 20, alto: 200, color: "#4caf50" } 
        ],
        puas: [{ x: 500, y: 350, ancho: 40, alto: 20 }, { x: 1200, y: 350, ancho: 60, alto: 20 }],
        items: [{ x: 1060, y: 210, ancho: 20, alto: 20, tipo: "espada", color: "#00f5d4", recolectado: false }],
        enemigos: [
            { x: 400, y: 340, ancho: 30, alto: 30, velocidadX: 2, limiteIzquierda: 350, limiteDerecha: 480, vivo: true },
            { x: 950, y: 340, ancho: 30, alto: 30, velocidadX: -2, limiteIzquierda: 870, limiteDerecha: 1080, vivo: true }
        ],
        bloquesSecretosMaster: []
    },
    {
        nombre: "Nivel 2", colorCielo: "#5c51a6",
        plataformas: [
            { x: 0, y: 370, ancho: 500, alto: 30, color: "#38b000" },
            { x: 650, y: 300, ancho: 200, alto: 20, color: "#ffb703" },
            { x: 1000, y: 370, ancho: 700, alto: 30, color: "#38b000" }, 
            { x: 1200, y: 250, ancho: 100, alto: 15, color: "#ffb703" },
            { x: 2000, y: 370, ancho: 800, alto: 30, color: "#38b000" },
            { x: 2100, y: 250, ancho: 150, alto: 20, color: "#ffb703" },
            { x: 2950, y: 370, ancho: 650, alto: 30, color: "#38b000" },
            { x: 3500, y: 170, ancho: 20, alto: 200, color: "#4caf50" } 
        ],
        puas: [{ x: 2200, y: 350, ancho: 40, alto: 20 }],
        items: [], 
        enemigos: [{ x: 300, y: 340, ancho: 30, alto: 30, velocidadX: 3, limiteIzquierda: 200, limiteDerecha: 450, vivo: true }],
        bloquesSecretosMaster: [
            { x: 720, y: 190, ancho: 30, alto: 30, descubierto: false, usado: false }
        ]
    },
    {
        nombre: "Nivel 3", colorCielo: "#1d2d44",
        plataformas: [
            { x: 0, y: 370, ancho: 500, alto: 30, color: "#7209b7" },
            { x: 600, y: 280, ancho: 250, alto: 20, color: "#4cc9f0" },
            { x: 950, y: 200, ancho: 250, alto: 20, color: "#4cc9f0" },
            { x: 1300, y: 370, ancho: 600, alto: 30, color: "#7209b7" }, 
            
            { x: 2000, y: 300, ancho: 300, alto: 20, color: "#4cc9f0" },
            { x: 2400, y: 210, ancho: 300, alto: 20, color: "#4cc9f0" },
            
            // ARENA DEL JEFE FINAL
            { x: 2850, y: 370, ancho: 800, alto: 30, color: "#ff0055" }, 
            { x: 2920, y: 260, ancho: 140, alto: 15, color: "#ffb703", tiempoPisada: 0, cayendo: false, velY: 0 }, 
            { x: 3100, y: 160, ancho: 140, alto: 15, color: "#ffb703", tiempoPisada: 0, cayendo: false, velY: 0 }, 
            
            // Bandera de control meta (Estará oculta o movida dinámicamente según 'modoEscapeActivo')
            { x: 3550, y: 170, ancho: 20, alto: 200, color: "#4caf50" } 
        ],
        puas: [
            { x: 350, y: 350, ancho: 100, alto: 20 },
            { x: 1450, y: 350, ancho: 150, alto: 20 },
            { x: 2100, y: 350, ancho: 100, alto: 20 }
        ],
        items: [], 
        enemigos: [
            { x: 200, y: 340, ancho: 30, alto: 30, velocidadX: 4, limiteIzquierda: 100, limiteDerecha: 320, vivo: true },
            { x: 2500, y: 170, ancho: 30, alto: 30, velocidadX: 2, limiteIzquierda: 2420, limiteDerecha: 2680, vivo: true }
        ],
        bloquesSecretosMaster: [
            { x: 1650, y: 240, ancho: 30, alto: 30, descubierto: false, usado: false }
        ]
    }
];

// --- CARGADOR DE NIVEL ---
function cargarNivel(indice) {
    let nivel = datosNiveles[indice];
    canvas.style.backgroundColor = nivel.colorCielo;

    // Clonación limpia
    plataformas = JSON.parse(JSON.stringify(nivel.plataformas));
    puas = JSON.parse(JSON.stringify(nivel.puas));
    items = JSON.parse(JSON.stringify(nivel.items));
    enemigos = JSON.parse(JSON.stringify(nivel.enemigos));
    bloquesSecretos = JSON.parse(JSON.stringify(nivel.bloquesSecretosMaster));

    ataquesFuego = [];

    // Si no estamos escapando activamente, reiniciamos el entorno de derrumbe
    if (indice !== 2 || !modoEscapeActivo) {
        escombros = [];
        modoEscapeActivo = false;
    }

    if (indice === 1) {
        miniJefe.vivo = true; miniJefe.vida = 5; miniJefe.x = 1350; miniJefe.y = 310; miniJefe.invulnerable = 0;
    }

    if (indice === 2) {
        if (!modoEscapeActivo) {
            jefeFinal.vivo = true; jefeFinal.vida = 8; jefeFinal.x = 3300; jefeFinal.y = 250;
            jefeFinal.invulnerable = 0; jefeFinal.cooldownDisparo = 0; jefeFinal.velocidadX = -2;
        } else {
            jefeFinal.vivo = false;
            // Si el modo escape está activo tras morir, forzamos la posición segura de la bandera al inicio
            let meta = plataformas.find(p => p.color === "#4caf50");
            if (meta) { meta.x = 50; meta.y = 170; }
        }
    }

    // Posicionamiento de Checkpoint
    if (indice === 2 && checkpointActivado) {
        jugador.x = checkpointX; 
        jugador.y = checkpointY; 
        camaraX = checkpointX - 400;
    } else {
        jugador.x = 100; jugador.y = 200; camaraX = 0;
    }

    jugador.velocidadX = 0; jugador.velocidadY = 0; jugador.saltosRealizados = 0;
}

// --- ESCUCHA DE TECLADO ---
const teclas = { ArrowRight: false, ArrowLeft: false };
window.addEventListener("keydown", (e) => {
    if (teclas.hasOwnProperty(e.key)) teclas[e.key] = true;
    if (e.key === "ArrowUp" || e.key === " " || e.code === "Space") ejecutarSalto();
    if ((e.key === "f" || e.key === "F" || e.key === "x" || e.key === "X") && tieneAtaque && !estaAtacando) ejecutarAtaque();
    
    // TRUCO SECRETO
    if (e.key === "p" || e.key === "P") {
        if (nivelActual < 2) {
            nivelActual = 2; tieneAtaque = true; tieneDobleSalto = true;
            alert("🤫 Truco activado: Iniciando Nivel 3 listo para la acción.");
            cargarNivel(nivelActual);
        }
    }
});
window.addEventListener("keyup", (e) => { if (teclas.hasOwnProperty(e.key)) teclas[e.key] = false; });

function bucleJuego() {
    if (!juegoTerminado) {
        actualizarFisicas();
        actualizarEnemigos();
        actualizarMiniJefe(); 
        actualizarJefeFinal(); 
        actualizarDerrumbe(); 
        actualizarBloquesSecretos(); 
        actualizarItems();
        actualizarCamara();
    }
    dibujarTodo();
    requestAnimationFrame(bucleJuego);
}

function ejecutarSalto() {
    if (jugador.enElSuelo) {
        jugador.velocidadY = -jugador.fuerzaSalto; jugador.enElSuelo = false; jugador.saltosRealizados = 1;
    } else if (tieneDobleSalto && jugador.saltosRealizados < 2) {
        jugador.velocidadY = -jugador.fuerzaSalto * 0.9; jugador.saltosRealizados = 2;
    }
}

function ejecutarAtaque() { estaAtacando = true; temporizadorAtaque = 15; }

function actualizarFisicas() {
    if (teclas.ArrowRight) { if (jugador.velocidadX < jugador.velocidadMovimiento) jugador.velocidadX++; jugador.direccion = 1; }
    if (teclas.ArrowLeft) { if (jugador.velocidadX > -jugador.velocidadMovimiento) jugador.velocidadX--; jugador.direccion = -1; }
    
    jugador.velocidadX *= FRICCION; jugador.x += jugador.velocidadX;
    jugador.velocidadY += GRAVEDAD; jugador.y += jugador.velocidadY;

    if (estaAtacando) { temporizadorAtaque--; if (temporizadorAtaque <= 0) estaAtacando = false; }
    jugador.enElSuelo = false;

    // Checkpoint preventivo de medio camino (Nivel 3 antes del Boss)
    if (nivelActual === 2 && !checkpointActivado && jugador.x >= checkpointX && !modoEscapeActivo) {
        checkpointActivado = true;
        checkpointX = 1800; checkpointY = 250;
        alert("🚩 Punto de control guardado.");
    }

    plataformas.forEach(plataforma => {
        // Si es la meta final, pero el jefe sigue vivo en el Nivel 3, desactivar su contacto físico
        if (nivelActual === 2 && !modoEscapeActivo && plataforma.color === "#4caf50") {
            return;
        }

        // Si la plataforma amarilla ya fue desprendida por el peso
        if (plataforma.cayendo) {
            plataforma.velY += 0.3;
            plataforma.y += plataforma.velY;
            return; 
        }

        // Cálculo clásico AABB de colisión
        if (jugador.x < plataforma.x + plataforma.ancho &&
            jugador.x + jugador.ancho > plataforma.x &&
            jugador.y < plataforma.y + plataforma.alto &&
            jugador.y + jugador.alto > plataforma.y) {
            
            if (plataforma.color === "#4caf50") {
                avanzarNivel(); return; 
            }

            if (jugador.velocidadY > 0 && (jugador.y + jugador.alto - jugador.velocidadY) <= plataforma.y) {
                jugador.y = plataforma.y - jugador.alto; jugador.velocidadY = 0; jugador.enElSuelo = true; jugador.saltosRealizados = 0;
                
                // Mecánica inestable si pisas bloques amarillos en el Templo colapsando
                if (nivelActual === 2 && plataforma.color === "#ffb703") {
                    plataforma.tiempoPisada++;
                    if (plataforma.tiempoPisada > 15) { 
                        plataforma.cayendo = true;
                    }
                }
            }
            else if (jugador.velocidadY < 0 && (jugador.y - jugador.velocidadY) >= plataforma.y + plataforma.alto) {
                jugador.y = plataforma.y + plataforma.alto; jugador.velocidadY = 0;
            }
        }
    });

    puas.forEach(pua => {
        if (jugador.x < pua.x + pua.ancho && jugador.x + jugador.ancho > pua.x &&
            jugador.y < pua.y + pua.alto && jugador.y + jugador.alto > pua.y) { morir(); }
    });

    if (jugador.x < 0) jugador.x = 0;
    if (jugador.y > canvas.height) morir(); 
}

// --- ACTUALIZACIÓN DE CAÍDA DE ESCOMBROS ---
function actualizarDerrumbe() {
    if (!modoEscapeActivo || nivelActual !== 2) return;

    letreroParpadeo++;
    temporizadorEscombros++;

    // Generador aleatorio controlado
    if (temporizadorEscombros % 22 === 0) { 
        let tamano = Math.random() * 20 + 15;
        escombros.push({
            x: camaraX + Math.random() * (canvas.width + 100) - 50, 
            y: -30,
            ancho: tamano,
            alto: tamano,
            velocidadY: Math.random() * 4 + 4
        });
    }

    // Movimiento y colisión de escombros
    for (let i = escombros.length - 1; i >= 0; i--) {
        let esc = escombros[i];
        esc.y += esc.velocidadY;

        if (jugador.x < esc.x + esc.ancho && jugador.x + jugador.ancho > esc.x &&
            jugador.y < esc.y + esc.alto && jugador.y + jugador.alto > esc.y) {
            escombros.splice(i, 1);
            morir();
            return;
        }
        if (esc.y > canvas.height) escombros.splice(i, 1);
    }
}

function actualizarJefeFinal() {
    if (nivelActual !== 2 || !jefeFinal.vivo) return;

    if (jefeFinal.invulnerable > 0) jefeFinal.invulnerable--;
    if (jefeFinal.cooldownDisparo > 0) jefeFinal.cooldownDisparo--;

    jefeFinal.x += jefeFinal.velocidadX;
    if (jefeFinal.x <= jefeFinal.limiteIzquierda || jefeFinal.x >= jefeFinal.limiteDerecha) {
        jefeFinal.velocidadX *= -1; 
    }

    let mismaAltura = (jugador.y + jugador.alto > jefeFinal.y && jugador.y < jefeFinal.y + jefeFinal.alto + 40);
    let rangoVision = 500;
    let jugadorALaIzquierda = (jugador.x < jefeFinal.x && jugador.x > jefeFinal.x - rangoVision);
    let jugadorALaDerecha = (jugador.x > jefeFinal.x + jefeFinal.ancho && jugador.x < jefeFinal.x + jefeFinal.ancho + rangoVision);

    if (mismaAltura && jefeFinal.cooldownDisparo === 0) {
        if (jugadorALaIzquierda) {
            ataquesFuego.push({ x: jefeFinal.x - 20, y: jefeFinal.y + 40, ancho: 25, alto: 25, velocidadX: -7 });
            jefeFinal.cooldownDisparo = 45; 
        } 
        else if (jugadorALaDerecha) {
            ataquesFuego.push({ x: jefeFinal.x + jefeFinal.ancho + 5, y: jefeFinal.y + 40, ancho: 25, alto: 25, velocidadX: 7 });
            jefeFinal.cooldownDisparo = 45; 
        }
    }

    for (let i = ataquesFuego.length - 1; i >= 0; i--) {
        let fuego = ataquesFuego[i];
        fuego.x += fuego.velocidadX;
        if (jugador.x < fuego.x + fuego.ancho && jugador.x + jugador.ancho > fuego.x &&
            jugador.y < fuego.y + fuego.alto && jugador.y + jugador.alto > fuego.y) {
            ataquesFuego.splice(i, 1); morir(); return;
        }
        if (fuego.x < 2000 || fuego.x > ANCHO_NIVEL) ataquesFuego.splice(i, 1);
    }

    let rangoAtaque = { x: jugador.direccion === 1 ? jugador.x + jugador.ancho : jugador.x - 40, y: jugador.y, ancho: 40, alto: jugador.alto };

    if (estaAtacando && jefeFinal.invulnerable === 0) {
        if (rangoAtaque.x < jefeFinal.x + jefeFinal.ancho && rangoAtaque.x + rangoAtaque.ancho > jefeFinal.x &&
            rangoAtaque.y < jefeFinal.y + jefeFinal.alto && rangoAtaque.y + rangoAtaque.alto > jefeFinal.y) {
            dañarJefeFinal();
        }
    }

    if (jugador.x < jefeFinal.x + jefeFinal.ancho && jugador.x + jugador.ancho > jefeFinal.x &&
        jugador.y < jefeFinal.y + jefeFinal.alto && jugador.y + jugador.alto > jefeFinal.y) {
        
        if (jugador.velocidadY > 0 && (jugador.y + jugador.alto - jugador.velocidadY) <= jefeFinal.y + 25 && jefeFinal.invulnerable === 0) {
            dañarJefeFinal();
            jugador.velocidadY = -jugador.fuerzaSalto * 0.9; 
        } else if (jefeFinal.invulnerable === 0) { morir(); }
    }
}

function dañarJefeFinal() {
    jefeFinal.vida--;
    jefeFinal.invulnerable = 30;
    if (jefeFinal.vida <= 0) {
        jefeFinal.vivo = false;
        ataquesFuego = [];
        
        // ACTIVAR MODO ESCAPE CRÍTICO
        modoEscapeActivo = true;
        checkpointActivado = true;
        checkpointX = jefeFinal.x; 
        checkpointY = jefeFinal.y;

        // Modificamos la estructura de la meta de manera segura reubicando sus coordenadas fijas
        let banderaMeta = plataformas.find(p => p.color === "#4caf50");
        if (banderaMeta) {
            banderaMeta.x = 50; 
            banderaMeta.y = 170;
        }

        alert("💥 ¡EL JEFE HA CAÍDO PERO EL TEMPLO SE COLAPSA! ¡Regresa de inmediato a la entrada principal (IZQUIERDA)!");
    }
}

function actualizarMiniJefe() {
    if (nivelActual !== 1 || !miniJefe.vivo) return;
    if (miniJefe.invulnerable > 0) miniJefe.invulnerable--;
    miniJefe.x += miniJefe.velocidadX;
    if (miniJefe.x <= miniJefe.limiteIzquierda || miniJefe.x >= miniJefe.limiteDerecha) miniJefe.velocidadX *= -1;

    let rangoAtaque = { x: jugador.direccion === 1 ? jugador.x + jugador.ancho : jugador.x - 40, y: jugador.y, ancho: 40, alto: jugador.alto };
    if (estaAtacando && miniJefe.invulnerable === 0) {
        if (rangoAtaque.x < miniJefe.x + miniJefe.ancho && rangoAtaque.x + rangoAtaque.ancho > miniJefe.x && rangoAtaque.y < miniJefe.y + miniJefe.alto && rangoAtaque.y + rangoAtaque.alto > miniJefe.y) {
            miniJefe.vida--; miniJefe.invulnerable = 25;
        }
    }
    if (jugador.x < miniJefe.x + miniJefe.ancho && jugador.x + jugador.ancho > miniJefe.x && jugador.y < miniJefe.y + miniJefe.alto && jugador.y + jugador.alto > miniJefe.y) {
        if (jugador.velocidadY > 0 && (jugador.y + jugador.alto - jugador.velocidadY) <= miniJefe.y + 15 && miniJefe.invulnerable === 0) {
            miniJefe.vida--; miniJefe.invulnerable = 25; jugador.velocidadY = -jugador.fuerzaSalto * 0.85;
        } else if (miniJefe.invulnerable === 0) { morir(); }
    }
    if (miniJefe.vida <= 0) {
        miniJefe.vivo = false;
        items.push({ x: miniJefe.x + 15, y: 340, ancho: 20, alto: 20, tipo: "botas", color: "#fee440", recolectado: false });
        alert("💥 ¡Mini Jefe derrotado! Recoge tus botas del suelo.");
    }
}

function actualizarEnemigos() {
    let rangoAtaque = { x: jugador.direccion === 1 ? jugador.x + jugador.ancho : jugador.x - 40, y: jugador.y, ancho: 40, alto: jugador.alto };
    enemigos.forEach(enemigo => {
        if (!enemigo.vivo) return;
        enemigo.x += enemigo.velocidadX;
        if (enemigo.x <= enemigo.limiteIzquierda || enemigo.x >= enemigo.limiteDerecha) enemigo.velocidadX *= -1;
        if (estaAtacando && rangoAtaque.x < enemigo.x + enemigo.ancho && rangoAtaque.x + rangoAtaque.ancho > enemigo.x && rangoAtaque.y < enemigo.y + enemigo.alto && rangoAtaque.y + rangoAtaque.alto > enemigo.y) {
            enemigo.vivo = false; return;
        }
        if (jugador.x < enemigo.x + enemigo.ancho && jugador.x + jugador.ancho > enemigo.x && jugador.y < enemigo.y + enemigo.alto && jugador.y + jugador.alto > enemigo.y) {
            if (jugador.velocidadY > 0 && (jugador.y + jugador.alto - jugador.velocidadY) <= enemigo.y + 10) {
                enemigo.vivo = false; jugador.velocidadY = -jugador.fuerzaSalto * 0.7;
            } else { morir(); }
        }
    });
}

function actualizarItems() {
    items.forEach(item => {
        if (item.recolectado) return;
        if (jugador.x < item.x + item.ancho && jugador.x + jugador.ancho > item.x && jugador.y < item.y + item.alto && jugador.y + jugador.alto > item.y) {
            item.recolectado = true;
            if (item.tipo === "espada") { tieneAtaque = true; alert("⚔️ ¡Tienes la Espada! Ataca usando F o X."); } 
            else if (item.tipo === "botas") { tieneDobleSalto = true; alert("👟 ¡Tienes las Botas! Salta de nuevo en el aire."); }
        }
    });
}

function actualizarBloquesSecretos() {
    bloquesSecretos.forEach(bloque => {
        if (jugador.x < bloque.x + bloque.ancho && jugador.x + jugador.ancho > bloque.x && jugador.y < bloque.y + bloque.alto && jugador.y + jugador.alto > bloque.y) {
            if (jugador.velocidadY < 0 && (jugador.y - jugador.velocidadY) >= bloque.y + bloque.alto - 10) {
                jugador.velocidadY = 1; 
                if (!bloque.descubierto) {
                    bloque.descubierto = true;
                    if (!bloque.usado) { bloque.usado = true; vidas++; livesElement.innerText = vidas; }
                }
            }
            else if (bloque.descubierto && jugador.velocidadY > 0 && (jugador.y + jugador.alto - jugador.velocidadY) <= bloque.y) {
                jugador.y = bloque.y - jugador.alto; jugador.velocidadY = 0; jugador.enElSuelo = true; jugador.saltosRealizados = 0;
            }
        }
    });
}

function actualizarCamara() {
    if (jugador.x > 400 && jugador.x < ANCHO_NIVEL - 400) camaraX = jugador.x - 400;
}

function avanzarNivel() {
    nivelActual++;
    if (nivelActual >= datosNiveles.length) {
        juegoTerminado = true;
        alert("🏆 ¡ERES UNA LEYENDA ABSOLUTA! Has derrotado al mal y escapado de las ruinas con vida.");
        checkpointActivado = false; modoEscapeActivo = false;
        reiniciarTodoElJuego();
    } else {
        alert(`🎉 Entrando al: ${datosNiveles[nivelActual].nombre}`);
        cargarNivel(nivelActual);
    }
}

function morir() {
    vidas--;
    livesElement.innerText = vidas;

    if (vidas <= 0) {
        alert("💀 GAME OVER. El templo te ha sepultado. Regresas al Nivel 1.");
        checkpointActivado = false; modoEscapeActivo = false;
        reiniciarTodoElJuego();
    } else {
        alert(`❌ ¡Cuidado! Perdiste una vida.`);
        cargarNivel(nivelActual); 
    }
}

function reiniciarTodoElJuego() {
    vidas = 3; nivelActual = 0; livesElement.innerText = vidas;
    tieneAtaque = false; tieneDobleSalto = false; estaAtacando = false;
    datosNiveles.forEach(nivel => { nivel.items.forEach(item => item.recolectado = false); });
    juegoTerminado = false; modoEscapeActivo = false;
    cargarNivel(nivelActual);
}

// --- DIBUJADO ---
function dibujarTodo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camaraX, 0);

    // Dibujar Plataformas
    plataformas.forEach(plataforma => {
        // En el nivel 3 ocultamos estéticamente la bandera del renderizado si el Boss sigue con vida
        if (nivelActual === 2 && !modoEscapeActivo && plataforma.color === "#4caf50") {
            return; 
        }
        ctx.fillStyle = plataforma.color; ctx.fillRect(plataforma.x, plataforma.y, plataforma.ancho, plataforma.alto);
    });

    bloquesSecretos.forEach(bloque => {
        if (bloque.descubierto) {
            ctx.fillStyle = "#00f5d4"; ctx.fillRect(bloque.x, bloque.y, bloque.ancho, bloque.alto);
            ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial"; ctx.fillText("+1V", bloque.x + 4, bloque.y + 18);
        }
    });

    puas.forEach(pua => {
        ctx.fillStyle = "#8d99ae"; ctx.fillRect(pua.x, pua.y, pua.ancho, pua.alto);
        ctx.fillStyle = "#1d2d44";
        for (let i = 0; i < pua.ancho; i += 10) ctx.fillRect(pua.x + i + 3, pua.y, 4, 6);
    });

    // Renderizar Checkpoints normales
    if (nivelActual === 2 && !modoEscapeActivo) {
        ctx.fillStyle = checkpointActivado ? "#4caf50" : "#ffb703"; 
        ctx.fillRect(checkpointX, 270, 6, 100); ctx.fillRect(checkpointX + 6, 270, 25, 20); 
    }

    items.forEach(item => { if (!item.recolectado) { ctx.fillStyle = item.color; ctx.fillRect(item.x, item.y, item.ancho, item.alto); } });
    enemigos.forEach(enemigo => { if (enemigo.vivo) { ctx.fillStyle = "#ff006e"; ctx.fillRect(enemigo.x, enemigo.y, enemigo.ancho, enemigo.alto); } });

    if (nivelActual === 1 && miniJefe.vivo) {
        ctx.fillStyle = (miniJefe.invulnerable % 4 > 2) ? "#fff" : "#ffb703"; ctx.fillRect(miniJefe.x, miniJefe.y, miniJefe.ancho, miniJefe.alto);
    }

    if (nivelActual === 2 && jefeFinal.vivo) {
        ctx.fillStyle = (jefeFinal.invulnerable % 4 > 2) ? "#fff" : "#d90429"; ctx.fillRect(jefeFinal.x, jefeFinal.y, jefeFinal.ancho, jefeFinal.alto);
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(jefeFinal.x - 10, jefeFinal.y - 25, jefeFinal.ancho + 20, 8);
        ctx.fillStyle = "#ff0055"; ctx.fillRect(jefeFinal.x - 10, jefeFinal.y - 25, ((jefeFinal.ancho + 20) / jefeFinal.maxVida) * jefeFinal.vida, 8);
    }

    ctx.fillStyle = "#ff5500";
    ataquesFuego.forEach(fuego => { ctx.fillRect(fuego.x, fuego.y, fuego.ancho, fuego.alto); });

    // RENDERIZAR ESCOMBROS DE PIEDRA (Gris Oscuro)
    ctx.fillStyle = "#555555";
    escombros.forEach(esc => { ctx.fillRect(esc.x, esc.y, esc.ancho, esc.alto); });

    if (estaAtacando) {
        ctx.fillStyle = "rgba(0, 245, 212, 0.6)";
        if (jugador.direccion === 1) ctx.fillRect(jugador.x + jugador.ancho, jugador.y, 40, jugador.alto);
        else ctx.fillRect(jugador.x - 40, jugador.y, 40, jugador.alto);
    }

    // Dibujo estético de la perilla superior de las banderas
    plataformas.forEach(plataforma => {
        if (plataforma.color === "#4caf50") { 
            if (nivelActual === 2 && !modoEscapeActivo) return;
            ctx.fillStyle = "#ffb703"; ctx.fillRect(plataforma.x - 5, plataforma.y, 30, 20); 
        }
    });

    ctx.fillStyle = jugador.color; ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
    ctx.restore();

    // IU Superior
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px Arial";
    ctx.fillText(datosNiveles[nivelActual].nombre, 20, 30);

    // SEÑAL ALERTA DE ESCAPE PARPADEANTE EN PANTALLA
    if (modoEscapeActivo && Math.floor(letreroParpadeo / 15) % 2 === 0) {
        ctx.fillStyle = "#ff0055";
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🚨 ¡¡ESCAPA!! ⬅️", canvas.width / 2, 55);
        ctx.textAlign = "left"; 
    }
}

// --- CONTROLES TÁCTILES PARA CELULARES ---
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnJump = document.getElementById("btn-jump");
const btnAttack = document.getElementById("btn-attack");

if (btnLeft && btnRight && btnJump && btnAttack) {
    // Mover a la izquierda
    btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); teclas.ArrowLeft = true; });
    btnLeft.addEventListener("touchend", (e) => { e.preventDefault(); teclas.ArrowLeft = false; });

    // Mover a la derecha
    btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); teclas.ArrowRight = true; });
    btnRight.addEventListener("touchend", (e) => { e.preventDefault(); teclas.ArrowRight = false; });

    // Saltar
    btnJump.addEventListener("touchstart", (e) => { 
        e.preventDefault(); 
        // Nota: Si tu función de saltar en game.js se llama diferente (ej. saltarJugador), cambia este nombre aquí:
        ejecutarSalto(); 
    });

    // Atacar
    btnAttack.addEventListener("touchstart", (e) => { 
        e.preventDefault(); 
        // Nota: Asegúrate de que estas variables coincidan con cómo las llamaste para el ataque
        if (tieneAtaque && !estaAtacando) ejecutarAtaque(); 
    });
}

// --- RUN ---
cargarNivel(nivelActual);
bucleJuego();
