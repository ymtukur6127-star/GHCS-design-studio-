// GHCS Structural Studio — front-end prototype.
// Projects are stored in this browser only. Do not store confidential data here.
const STORAGE_KEY = "ghcs_structural_projects_v1";
const COMPANY_EMAIL = ""; // Add the verified company email before publishing.

const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

function showDesign() {
  $("design").scrollIntoView({behavior:"smooth"});
}

function loadProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch (_) { return []; }
}
function saveProjects(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function renderProjects() {
  const list = $("projectList");
  const projects = loadProjects();
  if (!projects.length) {
    list.innerHTML = '<div class="panel">No projects saved yet. Add your first project above.</div>';
    return;
  }
  list.innerHTML = "";
  projects.forEach((p, index) => {
    const card = document.createElement("article");
    card.className = "project-card";
    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = p.name;
    const info = document.createElement("p");
    info.textContent = `${p.type} · ${p.location || "Location not specified"}`;
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = p.status;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      const current = loadProjects();
      current.splice(index, 1);
      saveProjects(current);
      renderProjects();
    });
    details.append(title, info);
    card.append(details, status, remove);
    list.append(card);
  });
}
$("projectForm").addEventListener("submit", event => {
  event.preventDefault();
  const project = {
    name: $("projectName").value.trim(),
    location: $("projectLocation").value.trim(),
    type: $("projectType").value,
    status: $("projectStatus").value,
    createdAt: new Date().toISOString()
  };
  const items = loadProjects();
  items.push(project);
  saveProjects(items);
  event.target.reset();
  renderProjects();
});
renderProjects();

const value = id => Number($(id).value);
const valid = (...values) => values.every(Number.isFinite);
const fmt = n => n.toLocaleString(undefined, {maximumFractionDigits:2});

function calculateBeam() {
  const L = value("span"), w = value("load");
  if (!valid(L,w) || L <= 0 || w < 0) {
    $("beamResult").textContent = "Enter a positive span and non-negative load.";
    return;
  }
  const M = w*L*L/8, V = w*L/2;
  $("beamResult").textContent =
    `Maximum moment = ${fmt(M)} kN·m; support shear = ${fmt(V)} kN.`;
}
function calculateColumn() {
  const P = value("axialLoad"), b = value("width"), h = value("depth");
  if (!valid(P,b,h) || P < 0 || b <= 0 || h <= 0) {
    $("columnResult").textContent = "Enter valid load and positive dimensions.";
    return;
  }
  const A = b*h, stress = P*1000/A;
  $("columnResult").textContent =
    `Gross area = ${fmt(A)} mm²; average axial stress = ${fmt(stress)} MPa.`;
}
function calculateSlab() {
  const t = value("slabThickness"), gamma = value("unitWeight"), q = value("imposedLoad");
  if (!valid(t,gamma,q) || t <= 0 || gamma <= 0 || q < 0) {
    $("slabResult").textContent = "Enter valid thickness, unit weight and imposed load.";
    return;
  }
  const selfWeight = t/1000*gamma;
  $("slabResult").textContent =
    `Estimated self-weight = ${fmt(selfWeight)} kN/m²; total of these two loads = ${fmt(selfWeight+q)} kN/m².`;
}
function calculateFooting() {
  const P = value("footLoad"), q = value("soilPressure");
  if (!valid(P,q) || P < 0 || q <= 0) {
    $("footingResult").textContent = "Enter a non-negative load and positive allowable soil pressure.";
    return;
  }
  const area = P/q;
  $("footingResult").textContent =
    `Preliminary plan area = ${fmt(area)} m²; equivalent square side = ${fmt(Math.sqrt(area))} m.`;
}
$("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const subject = encodeURIComponent("GHCS enquiry: " + $("enquiryType").value);
  const body = encodeURIComponent(
    `Name: ${$("clientName").value}\nReply contact: ${$("clientReply").value}\n` +
    `Type: ${$("enquiryType").value}\n\nMessage:\n${$("message").value}`
  );
  if (COMPANY_EMAIL.trim()) {
    window.location.href = `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`;
  } else {
    $("contactResult").textContent =
      "Enquiry prepared, but not sent. Add the company's verified email in script.js to open a pre-filled email.";
    const blob = new Blob([decodeURIComponent(body)], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "GHCS-enquiry.txt"; a.click();
    URL.revokeObjectURL(url);
  }
});
