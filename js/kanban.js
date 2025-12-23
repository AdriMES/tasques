// CONFIGURACIÓ I ESTAT
const STORAGE_KEY = "tasquesKanban";
let tasques = [];
let tascaEditant = null; // referència directa a la tasca que s’està editant

// FILTRES I CERCA
let filtres = {
  estat: null,       // "perFer", "enCurs", "fet" o null
  prioritat: null,   // "baixa", "mitjana", "alta" o null
  cerca: ""          // text per cercar en títol + descripció
};

// SELECTORS DOM
const form = document.querySelector("form");
const titolInput = form.querySelector("input[type='text']");
const descripcioInput = form.querySelector("textarea");
const prioritatSelect = form.querySelector("select");
const dataInput = form.querySelector("input[type='date']");
const botoSubmit = form.querySelector("button[type='submit']");

const colPerFer = document.getElementById("perFer");
const colEnCurs = document.getElementById("enCurs");
const colFet = document.getElementById("fet");

// Estadístiques
const totalTasquesEl = document.getElementById("totalTasques");
const statsPerFerEl = document.getElementById("statsPerFer");
const statsEnCursEl = document.getElementById("statsEnCurs");
const statsFetEl = document.getElementById("statsFet");
const percentatgeEl = document.getElementById("percentatgeCompletades");
const barraEl = document.getElementById("barraCompletades");

// Controls filtres i cerca
const filtresEstatEl = document.getElementById("filtresEstat");
const filtresPrioritatEl = document.getElementById("filtresPrioritat");
const cercaTasquesEl = document.getElementById("cercaTasques");

// MODEL DE TASQUES
function crearTasca({ titol, descripcio, prioritat, dataVenciment }) {
  return {
    id: Date.now(),
    titol,
    descripcio,
    prioritat,
    dataVenciment,
    estat: "perFer",
    creatEl: new Date().toISOString()
  };
}

// PERSISTÈNCIA
function carregarTasques() {
  const dades = localStorage.getItem(STORAGE_KEY);
  if (!dades) return [];
  return JSON.parse(dades).map(t => ({ ...t, id: Number(t.id) }));
}

function guardarTasques() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// FILTRAT
function getTasquesFiltrades(tasques, filtres) {
  return tasques.filter(t => {
    const coincideixEstat = filtres.estat ? t.estat === filtres.estat : true;
    const coincideixPrioritat = filtres.prioritat ? t.prioritat === filtres.prioritat : true;
    const text = (t.titol + " " + t.descripcio).toLowerCase();
    const coincideixCerca = filtres.cerca ? text.includes(filtres.cerca.toLowerCase()) : true;
    return coincideixEstat && coincideixPrioritat && coincideixCerca;
  });
}

// FORMULARI
form.addEventListener("submit", e => {
  e.preventDefault();

  if (!titolInput.value.trim()) return alert("El títol és obligatori");

  if (tascaEditant) {
    // Edició
    tascaEditant.titol = titolInput.value.trim();
    tascaEditant.descripcio = descripcioInput.value.trim();
    tascaEditant.prioritat = prioritatSelect.value.toLowerCase();
    tascaEditant.dataVenciment = dataInput.value;

    tascaEditant = null;
    botoSubmit.textContent = "Afegir tasca";
    botoSubmit.classList.remove("bg-yellow-600");
    botoSubmit.classList.add("bg-blue-600");

    guardarTasques();
    renderTauler();
    form.reset();
    return;
  }

  // Crear nova tasca
  const nova = crearTasca({
    titol: titolInput.value.trim(),
    descripcio: descripcioInput.value.trim(),
    prioritat: prioritatSelect.value.toLowerCase(),
    dataVenciment: dataInput.value
  });
  tasques.push(nova);
  guardarTasques();
  renderTauler();
  form.reset();
});

// FILTRES I CERCA
filtresEstatEl.addEventListener("change", () => {
  filtres.estat = filtresEstatEl.value || null;
  renderTauler();
});
filtresPrioritatEl.addEventListener("change", () => {
  filtres.prioritat = filtresPrioritatEl.value || null;
  renderTauler();
});
cercaTasquesEl.addEventListener("input", () => {
  filtres.cerca = cercaTasquesEl.value.trim();
  renderTauler();
});

// RENDERITZACIÓ
function renderTauler() {
  colPerFer.innerHTML = "";
  colEnCurs.innerHTML = "";
  colFet.innerHTML = "";

  const tasquesFiltrades = getTasquesFiltrades(tasques, filtres);

  tasquesFiltrades.forEach(tasca => {
    const card = crearCardTasca(tasca);

    if (tasca.estat === "perFer") colPerFer.appendChild(card);
    if (tasca.estat === "enCurs") colEnCurs.appendChild(card);
    if (tasca.estat === "fet") colFet.appendChild(card);
  });

  actualitzarEstadistiques();
}

// CREAR CARD
function crearCardTasca(tasca) {
  const card = document.createElement("div");

  const colorsPrioritat = {
    baixa: "border-green-400",
    mitjana: "border-yellow-400",
    alta: "border-red-400"
  };

  card.className = `
    bg-white rounded-lg shadow p-4 border-l-4
    ${colorsPrioritat[tasca.prioritat]}
  `;

  card.innerHTML = `
    <h3 class="font-semibold text-slate-800">${tasca.titol}</h3>
    <p class="text-sm text-slate-600 mb-2">${tasca.descripcio || ""}</p>
    <div class="text-xs text-slate-500 mb-2">
      Prioritat: <strong>${tasca.prioritat}</strong><br>
      Data límit: ${tasca.dataVenciment || "-"}
    </div>
    <select class="w-full mb-2 rounded border p-1 text-sm">
      <option value="perFer" ${tasca.estat === "perFer" ? "selected" : ""}>Per fer</option>
      <option value="enCurs" ${tasca.estat === "enCurs" ? "selected" : ""}>En curs</option>
      <option value="fet" ${tasca.estat === "fet" ? "selected" : ""}>Fet</option>
    </select>
    <div class="flex gap-2">
      <button type="button" class="editar flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 rounded">Editar</button>
      <button type="button" class="eliminar flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded">Eliminar</button>
    </div>
  `;

  // Canvi d'estat
  card.querySelector("select").addEventListener("change", e => {
    tasca.estat = e.target.value;
    guardarTasques();
    renderTauler();
  });

  // Editar
  card.querySelector(".editar").addEventListener("click", () => {
    titolInput.value = tasca.titol;
    descripcioInput.value = tasca.descripcio;
    prioritatSelect.value = capitalitzar(tasca.prioritat);
    dataInput.value = tasca.dataVenciment;

    tascaEditant = tasca; // referència directa
    botoSubmit.textContent = "Guardar canvis";
    botoSubmit.classList.remove("bg-blue-600");
    botoSubmit.classList.add("bg-yellow-600");
  });

  // Eliminar
  card.querySelector(".eliminar").addEventListener("click", () => {
    if (confirm("Vols eliminar aquesta tasca?")) {
      tasques = tasques.filter(t => t.id !== tasca.id);
      guardarTasques();
      renderTauler();
    }
  });

  return card;
}

// UTIL
function capitalitzar(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ESTADÍSTIQUES
function actualitzarEstadistiques() {
  const total = tasques.length;
  const perFer = tasques.filter(t => t.estat === "perFer").length;
  const enCurs = tasques.filter(t => t.estat === "enCurs").length;
  const fet = tasques.filter(t => t.estat === "fet").length;
  const percent = total ? Math.round((fet / total) * 100) : 0;

  totalTasquesEl.textContent = total;
  statsPerFerEl.textContent = perFer;
  statsEnCursEl.textContent = enCurs;
  statsFetEl.textContent = fet;
  percentatgeEl.textContent = percent + "%";
  barraEl.style.width = percent + "%";
}

// INICIALITZACIÓ
tasques = carregarTasques();
renderTauler();
