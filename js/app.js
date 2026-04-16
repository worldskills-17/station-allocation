// State
let competitors = [];
let config = {};

// Initialization

async function initializeApp() {
  config = loadConfig();

  if (!config) {
    await showAlert(
      "Welcome! To use the Station Allocation Generator, you need to complete the setup first.<br><br>You will be redirected to the setup page...",
      "info",
      "Setup Required",
    );
    window.location.href = "setup.html";
    return;
  }

  applyTheme(config.gradientStart, config.gradientEnd);

  if (config.logoPath) {
    displayLogo(config.logoPath);
  }

  await loadCompetitors();
  createBuildingBlocksBackground(
    config.gradientStart || "#72d0eb",
    config.gradientEnd || "#0084ad",
  );
  setupEventListeners();
}

// UI Setup
function displayLogo(logoPath) {
  const header = document.querySelector("header");
  const existingLogo = document.querySelector(".header-logo");

  if (existingLogo) {
    existingLogo.remove();
  }

  const logo = document.createElement("img");
  logo.src = logoPath;
  logo.alt = "Competition Logo";
  logo.className = "header-logo";
  logo.style.filter = "none";

  header.insertBefore(logo, header.firstChild);
}

async function loadCompetitors() {
  if (config.competitors && config.competitors.length > 0) {
    competitors = config.competitors;
  } else {
    await showAlert(
      "No competitors found in configuration. Redirecting to setup page...",
      "error",
      "Setup Required",
    );
    window.location.href = "setup.html";
  }
}

function setupEventListeners() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        generateAllocation();
      }
    });
  });

  const wordInputs = ["word1", "word2", "word3"];
  wordInputs.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-z]/g, "");
    });
    input.addEventListener("keypress", function (e) {
      if (!/[A-Za-z]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });

  const numberInputs = ["digit1", "digit2", "digit3"];
  numberInputs.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", function () {
      let val = parseInt(this.value);
      if (isNaN(val)) {
        this.value = "";
      } else if (val < 0) {
        this.value = "0";
      } else if (val > 99) {
        this.value = "99";
      }
    });
  });
}

// Form Actions
function clearForm() {
  document.getElementById("word1").value = "";
  document.getElementById("word2").value = "";
  document.getElementById("word3").value = "";
  document.getElementById("digit1").value = "";
  document.getElementById("digit2").value = "";
  document.getElementById("digit3").value = "";

  document.getElementById("results").classList.remove("show");
  document.getElementById("word1").focus();
}

async function generateAllocation() {
  const word1 = document.getElementById("word1").value.trim();
  const word2 = document.getElementById("word2").value.trim();
  const word3 = document.getElementById("word3").value.trim();
  const digit1 = document.getElementById("digit1").value;
  const digit2 = document.getElementById("digit2").value;
  const digit3 = document.getElementById("digit3").value;

  if (
    !word1 ||
    !word2 ||
    !word3 ||
    digit1 === "" ||
    digit2 === "" ||
    digit3 === ""
  ) {
    await showAlert(
      "Please fill in all fields to generate the allocation",
      "warning",
      "Missing Information",
    );
    return;
  }

  const letterRegex = /^[A-Za-z]+$/;
  if (
    !letterRegex.test(word1) ||
    !letterRegex.test(word2) ||
    !letterRegex.test(word3)
  ) {
    await showAlert(
      "Words must contain only letters (A-Z)",
      "warning",
      "Invalid Word Format",
    );
    return;
  }

  const num1 = parseInt(digit1);
  const num2 = parseInt(digit2);
  const num3 = parseInt(digit3);

  if (num1 < 0 || num1 > 99 || num2 < 0 || num2 > 99 || num3 < 0 || num3 > 99) {
    await showAlert(
      "Numbers must be between 0 and 99",
      "warning",
      "Invalid Number Range",
    );
    return;
  }

  const seedString = `${word1}, ${word2}, ${word3}, ${digit1}, ${digit2}, ${digit3}`;
  const seed = hashString(seedString);
  const rng = new SeededRandom(seed);
  const shuffledCompetitors = seededShuffle(competitors, rng);

  displayResults(shuffledCompetitors, seedString);
}

// Display Results
function displayResults(shuffledCompetitors, seedString) {
  const resultsContainer = document.getElementById("results");
  const allocationGrid = document.getElementById("allocation-grid");

  allocationGrid.innerHTML = "";

  shuffledCompetitors.forEach((competitor, index) => {
    const station = index + 1;
    const card = createCompetitorCard(station, competitor);
    allocationGrid.appendChild(card);
  });

  document.getElementById("seed-display").textContent = `Seed: ${seedString}`;
  resultsContainer.classList.add("show");
  resultsContainer.scrollIntoView({ behavior: "smooth" });
}

function createCompetitorCard(station, competitor) {
  const card = document.createElement("div");
  card.className = "competitor-card";

  const fullName = `${competitor.firstName} ${competitor.lastName}`;
  const flagPath = `img/flags/${competitor.countryCode}.svg`;
  const countryCode = competitor.countryCode;

  card.innerHTML = `
    <div class="station-header">
      <div class="station-number">Station ${station}</div>
      <div class="flag-container">
        <img src="${flagPath}" alt="${countryCode}" class="country-flag" onerror="this.style.display='none'">
        <div class="country-code">${countryCode}</div>
      </div>
    </div>
    <div class="competitor-name">${fullName}</div>
  `;

  return card;
}

// Navigation & Export
function goToSetup() {
  window.location.href = "setup.html";
}

async function saveSeed() {
  const seedDisplay = document.getElementById("seed-display");
  if (!seedDisplay || !seedDisplay.textContent) {
    await showAlert(
      "No seed to save. Please generate an allocation first.",
      "warning",
      "No Seed",
    );
    return;
  }

  // Ask user for format
  const format = await showFormatChoice();
  if (!format) return;

  const seedText = seedDisplay.textContent.replace("Seed: ", "");
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const readableTimestamp = now.toLocaleString();

  const allocationGrid = document.getElementById("allocation-grid");
  const competitorCards = allocationGrid.querySelectorAll(".competitor-card");

  // Build allocation data
  const allocations = [];
  competitorCards.forEach((card, index) => {
    const station = index + 1;
    const nameElement = card.querySelector(".competitor-name");
    const flagElement = card.querySelector(".country-flag");
    const name = nameElement ? nameElement.textContent : "Unknown";
    const countrySrc = flagElement ? flagElement.getAttribute("src") : "";
    let countryCode = "XX";
    if (countrySrc) {
      const match = countrySrc.match(/\/([A-Z]{2})\.svg/);
      countryCode = match ? match[1] : "XX";
    }
    allocations.push({ station, name, countryCode });
  });

  if (format === "pdf") {
    savePDF(allocations, seedText, readableTimestamp, timestamp);
  } else {
    saveTXT(allocations, seedText, readableTimestamp, timestamp);
  }
}

function showFormatChoice() {
  return new Promise((resolve) => {
    const modal = createModalContainer();

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon info">&#x2193;</div>
          <h3 class="modal-title">Save Format</h3>
        </div>
        <div class="modal-body">
          Choose the format to save the allocation:
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-secondary" id="modal-cancel-btn">Cancel</button>
          <button class="modal-button modal-button-secondary" id="modal-txt-btn">Save as TXT</button>
          <button class="modal-button modal-button-primary" id="modal-pdf-btn">Save as PDF</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    modal.querySelector("#modal-pdf-btn").addEventListener("click", () => {
      modal.classList.remove("show");
      resolve("pdf");
    });
    modal.querySelector("#modal-txt-btn").addEventListener("click", () => {
      modal.classList.remove("show");
      resolve("txt");
    });
    modal.querySelector("#modal-cancel-btn").addEventListener("click", () => {
      modal.classList.remove("show");
      resolve(null);
    });
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        resolve(null);
      }
    };
  });
}

async function savePDF(allocations, seedText, readableTimestamp, timestamp) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("WorldSkills Station Allocation", pageWidth / 2, 25, { align: "center" });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Record", pageWidth / 2, 33, { align: "center" });

  // Timestamp
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${readableTimestamp}`, pageWidth / 2, 40, { align: "center" });
  doc.setTextColor(0);

  // Seed
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Seed: ${seedText}`, pageWidth / 2, 50, { align: "center" });

  // Divider line
  doc.setDrawColor(0, 132, 173);
  doc.setLineWidth(0.5);
  doc.line(20, 55, pageWidth - 20, 55);

  // Table header
  let y = 65;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(0, 132, 173);
  doc.setTextColor(255);
  doc.rect(20, y - 5, pageWidth - 40, 8, "F");
  doc.text("Station", 25, y);
  doc.text("Competitor", 55, y);
  doc.text("Country", pageWidth - 40, y);

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  y += 10;

  allocations.forEach((a, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Alternate row background
    if (i % 2 === 0) {
      doc.setFillColor(240, 248, 252);
      doc.rect(20, y - 5, pageWidth - 40, 8, "F");
    }

    doc.text(`Station ${a.station.toString().padStart(2, "0")}`, 25, y);
    doc.text(a.name, 55, y);
    doc.text(a.countryCode, pageWidth - 40, y);
    y += 8;
  });

  // Footer
  y += 10;
  doc.setDrawColor(0, 132, 173);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total Competitors: ${allocations.length}`, 20, y);
  y += 6;
  doc.text("This seed can be used to regenerate the exact same station allocation.", 20, y);
  y += 6;
  doc.text(`\u00A9 WorldSkills ${new Date().getFullYear()}`, 20, y);

  const fileName = `allocation-${timestamp}.pdf`;
  doc.save(fileName);

  await showAlert(
    `Allocation saved successfully as:<br><strong>${fileName}</strong>`,
    "success",
    "Allocation Saved",
  );
}

async function saveTXT(allocations, seedText, readableTimestamp, timestamp) {
  let allocationList = "";
  allocations.forEach((a) => {
    allocationList += `Station ${a.station.toString().padStart(2, "0")}: ${a.name.padEnd(30)} [${a.countryCode}]\n`;
  });

  const fileContent = `WorldSkills Station Allocation - Official Record
==================================================

SEED: ${seedText}
Generated: ${readableTimestamp}

STATION ALLOCATION
--------------------------------------------------
${allocationList}
--------------------------------------------------

Competition Configuration:
- Total Competitors: ${allocations.length}

REPRODUCIBILITY
This seed value can be used to regenerate the exact same station
allocation. Enter the seed values in the generator to reproduce
these results.

\u00A9 WorldSkills ${new Date().getFullYear()}
`;

  const fileName = `allocation-${timestamp}.txt`;
  const blob = new Blob([fileContent], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  await showAlert(
    `Allocation saved successfully as:<br><strong>${fileName}</strong>`,
    "success",
    "Allocation Saved",
  );
}

document.addEventListener("DOMContentLoaded", initializeApp);
