//CONFIGURACIÓ I ESTAT

const STORAGE_KEY = "tasquesKanban";
let tasques = [];
let tascaEditantId = null;


//SELECTORS DOM
const form = document.querySelector("form");
const titolInput = form.querySelector("input[type='text']");
const descripcioInput = form.querySelector("textarea");
const prioritatSelect = form.querySelector("select");
const dataInput = form.querySelector("input[type='date']");

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
