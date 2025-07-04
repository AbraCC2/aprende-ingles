const frases = {
  facil: [
    ["Good morning", "Buenos días"],
    ["How are you?", "¿Cómo estás?"],
    ["I am hungry", "Tengo hambre"],
    ["See you later", "Nos vemos luego"],
    ["Thank you", "Gracias"]
  ],
  intermedio: [
    ["I need to go to the store", "Necesito ir a la tienda"],
    ["Can you help me with this?", "¿Puedes ayudarme con esto?"],
    ["I don't understand the question", "No entiendo la pregunta"],
    ["Where is the nearest hospital?", "¿Dónde está el hospital más cercano?"],
    ["I'm looking for a taxi", "Estoy buscando un taxi"]
  ],
  dificil: [
    ["I would have gone if I had known", "Habría ido si lo hubiera sabido"],
    ["She has been working since morning", "Ella ha estado trabajando desde la mañana"],
    ["If I were you, I would call him", "Si yo fuera tú, lo llamaría"],
    ["They must have forgotten the meeting", "Deben haber olvidado la reunión"],
    ["Had it not rained, we would have played", "Si no hubiera llovido, habríamos jugado"]
  ]
};

let modo = "en-es";
let nivel = "facil";
let indice = 0;
let puntaje = 0;
let orden = [];

const modoSelect = document.getElementById("modo");
const nivelSelect = document.getElementById("nivel");
const fraseEl = document.getElementById("frase");
const opcionesEl = document.getElementById("opciones");
const resultadoEl = document.getElementById("resultado");
const puntajeEl = document.getElementById("puntaje");
const favoritoBtn = document.getElementById("favoritoBtn");
const verFavoritasBtn = document.getElementById("verFavoritasBtn");
const repetirBtn = document.getElementById("repetirBtn");
const hablarBtn = document.getElementById("hablarBtn");

let favoritas = cargarFavoritas();

modoSelect.addEventListener("change", () => {
  modo = modoSelect.value;
  iniciar();
});
nivelSelect.addEventListener("change", () => {
  nivel = nivelSelect.value;
  iniciar();
});

favoritoBtn.addEventListener("click", () => {
  const clave = fraseClaveActual();
  if (favoritas.includes(clave)) {
    favoritas = favoritas.filter(f => f !== clave);
  } else {
    favoritas.push(clave);
  }
  guardarFavoritas();
  actualizarBotonFavorito();
});

verFavoritasBtn.addEventListener("click", () => {
  if (favoritas.length === 0) {
    alert("No tienes frases favoritas aún.");
    return;
  }
  const lista = favoritas.map(clave => {
    const [nivelF, index] = clave.split("-");
    const [en, es] = frases[nivelF][index];
    return `• ${en} → ${es}`;
  }).join("\n");
  alert("⭐ Tus frases favoritas:\n\n" + lista);
});

repetirBtn.addEventListener("click", () => {
  hablar(fraseActual());
});

hablarBtn.addEventListener("click", () => {
  reconocerVoz();
});

function iniciar() {
  indice = 0;
  puntaje = 0;
  orden = [...Array(frases[nivel].length).keys()];
  orden.sort(() => Math.random() - 0.5);
  mostrarPregunta();
}

function mostrarPregunta() {
  if (indice >= frases[nivel].length) {
    fraseEl.textContent = "¡Has terminado!";
    opcionesEl.innerHTML = "";
    resultadoEl.textContent = "";
    puntajeEl.textContent = `Puntaje: ${puntaje} de ${frases[nivel].length}`;
    favoritoBtn.style.display = "none";
    return;
  }

  const [en, es] = frases[nivel][orden[indice]];
  const correcta = modo === "en-es" ? es : en;
  const pregunta = modo === "en-es" ? en : es;

  fraseEl.textContent = pregunta;
  hablar(modo === "en-es" ? en : "");

  const opciones = new Set();
  opciones.add(correcta);
  while (opciones.size < 4) {
    const aleatoria = frases[nivel][Math.floor(Math.random() * frases[nivel].length)];
    const valor = modo === "en-es" ? aleatoria[1] : aleatoria[0];
    opciones.add(valor);
  }

  const mezcladas = Array.from(opciones).sort(() => Math.random() - 0.5);
  opcionesEl.innerHTML = "";

  mezcladas.forEach((op) => {
    const btn = document.createElement("button");
    btn.textContent = op;
    btn.onclick = () => {
      if (op === correcta) {
        resultadoEl.textContent = "✅ MUY BIEN DAYANI.";
        puntaje++;
      } else {
        resultadoEl.textContent = `❌ Incorrecto. Era: ${correcta}`;
      }
      indice++;
      setTimeout(() => {
        resultadoEl.textContent = "";
        mostrarPregunta();
      }, 1400);
    };
    opcionesEl.appendChild(btn);
  });

  puntajeEl.textContent = `Puntaje: ${puntaje}`;
  favoritoBtn.style.display = "inline-block";
  actualizarBotonFavorito();
}

function fraseClaveActual() {
  return `${nivel}-${orden[indice]}`;
}

function fraseActual() {
  const [en, es] = frases[nivel][orden[indice]];
  return modo === "en-es" ? en : es;
}

function actualizarBotonFavorito() {
  const clave = fraseClaveActual();
  if (favoritas.includes(clave)) {
    favoritoBtn.textContent = "💔 Quitar de favoritas";
  } else {
    favoritoBtn.textContent = "⭐ Marcar como favorita";
  }
}

function guardarFavoritas() {
  localStorage.setItem("frasesFavoritas", JSON.stringify(favoritas));
}

function cargarFavoritas() {
  return JSON.parse(localStorage.getItem("frasesFavoritas") || "[]");
}

function hablar(texto) {
  if (!texto) return;
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = modo === "en-es" ? "en-US" : "es-ES";
  window.speechSynthesis.speak(msg);
}

function reconocerVoz() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = modo === "en-es" ? "es-ES" : "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const textoDicho = event.results[0][0].transcript.trim().toLowerCase();
    const correcto = fraseActual().toLowerCase();
    if (textoDicho === correcto) {
      resultadoEl.textContent = "🎤 MUY BIEN DAYANI. ¡Lo dijiste perfecto!";
      puntaje++;
    } else {
      resultadoEl.textContent = `🎤 Dijiste: "${textoDicho}" — debía ser: "${correcto}"`;
    }
    indice++;
    setTimeout(() => {
      resultadoEl.textContent = "";
      mostrarPregunta();
    }, 2500);
  };

  recognition.onerror = () => {
    resultadoEl.textContent = "🎤 No se entendió. Intenta de nuevo.";
  };
}

iniciar();