// CONFIGURACIÓ I ESTAT
const STORAGE_KEY = "tasquesKanban";
let tasques = [];
let tascaEditant = null; // 🔑 referència directa a la tasca que s’està editant

// SELECTORS DOM
const form = document.querySelector("form");
const titolInput = form.querySelector("input[type='text']");
const descripcioInput = form.querySelector("textarea");
const prioritatSelect = form.querySelector("select");
const dataInput = form.querySelector("input[type='date']");

const colPerFer = document.getElementById("perFer");
const colEnCurs = document.getElementById("enCurs");
const colFet = document.getElementById("fet");
const botoSubmit = form.querySelector("button[type='submit']");

// Estadístiques
const totalTasquesEl = document.getElementById("totalTasques");
const statsPerFerEl = document.getElementById("statsPerFer");
const statsEnCursEl = document.getElementById("statsEnCurs");
const statsFetEl = document.getElementById("statsFet");
const percentatgeEl = document.getElementById("percentatgeCompletades");
const barraEl = document.getElementById("barraCompletades");

// MODEL DE TASQUES
function crearTasca({ titol, descripcio, prioritat, dataVenciment }) {
  return {
    id: Date.now(), // Number únic
    titol,
    descripcio,
    prioritat, // baixa | mitjana | alta
    dataVenciment,
    estat: "perFer",
    creatEl: new Date().toISOString()
  };
}

// PERSISTÈNCIA A LOCALSTORAGE
function carregarTasques() {
  const dades = localStorage.getItem(STORAGE_KEY);
  if (!dades) return [];
  return JSON.parse(dades).map(t => ({
    ...t,
    id: Number(t.id) // assegurem que tots els IDs siguin Number
  }));
}

function guardarTasques() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// FORMULARI
form.addEventListener("submit", e => {
  e.preventDefault();

  if (!titolInput.value.trim()) {
    alert("El títol és obligatori");
    return;
  }

  // EDITAR TASCA EXISTENT
  if (tascaEditant) {
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
    return; // 🔒 important
  }

  // CREAR NOVA TASCA
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

// RENDERITZACIÓ KANBAN
function renderTauler() {
  colPerFer.innerHTML = "";
  colEnCurs.innerHTML = "";
  colFet.innerHTML = "";

  tasques.forEach(tasca => {
    const card = crearCardTasca(tasca);

    if (tasca.estat === "perFer") colPerFer.appendChild(card);
    if (tasca.estat === "enCurs") colEnCurs.appendChild(card);
    if (tasca.estat === "fet") colFet.appendChild(card);
  });

  actualitzarEstadistiques();
}

// CREAR TARGETA TASCA
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
      <button type="button" class="editar flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 rounded">
        Editar
      </button>
      <button type="button" class="eliminar flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded">
        Eliminar
      </button>
    </div>
  `;

  // CANVI D'ESTAT
  card.querySelector("select").addEventListener("change", e => {
    tasca.estat = e.target.value;
    guardarTasques();
    renderTauler();
  });

  // EDITAR
  card.querySelector(".editar").addEventListener("click", () => {
    titolInput.value = tasca.titol;
    descripcioInput.value = tasca.descripcio;
    prioritatSelect.value = capitalitzar(tasca.prioritat);
    dataInput.value = tasca.dataVenciment;

    tascaEditant = tasca; // 🔑 referència directa a l’objecte
    botoSubmit.textContent = "Guardar canvis";
    botoSubmit.classList.remove("bg-blue-600");
    botoSubmit.classList.add("bg-yellow-600");
  });

  // ELIMINAR
  card.querySelector(".eliminar").addEventListener("click", () => {
    if (confirm("Vols eliminar aquesta tasca?")) {
      tasques = tasques.filter(t => t.id !== tasca.id);
      guardarTasques();
      renderTauler();
    }
  });

  return card;
}

// UTILS
function capitalitzar(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// INICIALITZACIÓ
tasques = carregarTasques();
renderTauler();
