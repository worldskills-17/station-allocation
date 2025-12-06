// State
let uploadedCompetitors = [];
let uploadedLogoPath = null;

// Initialization
function initializeSetup() {
  const existingConfig = loadConfig();

  let gradientStart = "#72d0eb";
  let gradientEnd = "#0084ad";

  if (existingConfig) {
    populateFormWithConfig(existingConfig);
    if (existingConfig.gradientStart)
      gradientStart = existingConfig.gradientStart;
    if (existingConfig.gradientEnd) gradientEnd = existingConfig.gradientEnd;
  }

  createBuildingBlocksBackground(gradientStart, gradientEnd);
  setupEventListeners();
  updateColorPreview();
}

// Form Population
function populateFormWithConfig(config) {
  if (config.gradientStart) {
    document.getElementById("gradient-start-hex").value = config.gradientStart;
    document.getElementById("gradient-start-preview").style.background =
      config.gradientStart;
  }
  if (config.gradientEnd) {
    document.getElementById("gradient-end-hex").value = config.gradientEnd;
    document.getElementById("gradient-end-preview").style.background =
      config.gradientEnd;
  }
  if (config.logoPath) {
    uploadedLogoPath = config.logoPath;
    document.getElementById("logo-name").textContent = `Current logo loaded`;
    document.getElementById("logo-name").classList.add("loaded");
    updateLogoPreview(config.logoPath);
  }
  if (config.competitors) {
    uploadedCompetitors = config.competitors;
    document.getElementById("file-name").textContent =
      `${config.competitors.length} competitors loaded`;
    document.getElementById("file-name").classList.add("loaded");
  }

  updateColorPreview();
}

function setupEventListeners() {
  setupColorPicker();
  document
    .getElementById("competitors-file")
    .addEventListener("change", handleFileUpload);
  document
    .getElementById("logo-file")
    .addEventListener("change", handleLogoUpload);
}

// Custom Color Picker
function setupColorPicker() {
  const modal = document.getElementById("color-picker-modal");
  const canvas = document.getElementById("color-canvas");
  const ctx = canvas.getContext("2d");
  const canvasContainer = document.getElementById("color-canvas-container");
  const cursor = document.getElementById("color-cursor");
  const hueSlider = document.getElementById("hue-slider");
  const hueCursor = document.getElementById("hue-cursor");
  const colorCurrent = document.getElementById("color-current");
  const colorHexDisplay = document.getElementById("color-hex-display");
  const cancelBtn = document.getElementById("color-cancel");
  const okBtn = document.getElementById("color-ok");

  let currentType = null; // 'start' or 'end'
  let currentHue = 195; // Default blue hue for #72d0eb
  let currentSaturation = 0.51;
  let currentValue = 0.92;
  let isDraggingCanvas = false;
  let isDraggingHue = false;

  const size = 280;
  canvas.width = size;
  canvas.height = size;

  // Draw HSV saturation/value canvas for current hue
  function drawCanvas() {
    for (let row = 0; row < size; row++) {
      const gradient = ctx.createLinearGradient(0, row, size, row);
      const v = 1 - row / size;
      const color0 = hsvToRgb(currentHue, 0, v);
      const color1 = hsvToRgb(currentHue, 1, v);

      gradient.addColorStop(0, `rgb(${color0.r}, ${color0.g}, ${color0.b})`);
      gradient.addColorStop(1, `rgb(${color1.r}, ${color1.g}, ${color1.b})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, row, size, 1);
    }
  }

  function updateCanvasCursor() {
    const x = currentSaturation * size;
    const y = (1 - currentValue) * size;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }

  function updateHueCursor() {
    const x = (currentHue / 360) * hueSlider.offsetWidth;
    hueCursor.style.left = `${x}px`;
  }

  function updatePreview() {
    const rgb = hsvToRgb(currentHue, currentSaturation, currentValue);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    colorCurrent.style.background = hex;
    colorHexDisplay.textContent = hex.toUpperCase();
  }

  function openModal(type) {
    currentType = type;
    const hexInput = document.getElementById(`gradient-${type}-hex`);
    const currentColor = hexInput.value;

    const rgb = hexToRgb(currentColor);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    currentHue = hsv.h;
    currentSaturation = hsv.s;
    currentValue = hsv.v;

    drawCanvas();
    updateCanvasCursor();
    updateHueCursor();
    updatePreview();

    modal.classList.add("show");
  }

  function closeModal() {
    modal.classList.remove("show");
    currentType = null;
  }

  function applyColor() {
    if (!currentType) return;

    const rgb = hsvToRgb(currentHue, currentSaturation, currentValue);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    const hexInput = document.getElementById(`gradient-${currentType}-hex`);
    const preview = document.getElementById(`gradient-${currentType}-preview`);

    hexInput.value = hex;
    preview.style.background = hex;

    updateColorPreview();
    closeModal();
  }

  canvasContainer.addEventListener("mousedown", (e) => {
    isDraggingCanvas = true;
    handleCanvasInteraction(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingCanvas) handleCanvasInteraction(e);
    if (isDraggingHue) handleHueInteraction(e);
  });

  document.addEventListener("mouseup", () => {
    isDraggingCanvas = false;
    isDraggingHue = false;
  });

  function handleCanvasInteraction(e) {
    const rect = canvasContainer.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, size));
    let y = Math.max(0, Math.min(e.clientY - rect.top, size));

    currentSaturation = x / size;
    currentValue = 1 - y / size;

    updateCanvasCursor();
    updatePreview();
  }

  hueSlider.addEventListener("mousedown", (e) => {
    isDraggingHue = true;
    handleHueInteraction(e);
  });

  function handleHueInteraction(e) {
    const rect = hueSlider.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    currentHue = (x / rect.width) * 360;

    drawCanvas();
    updateHueCursor();
    updatePreview();
  }

  document
    .getElementById("gradient-start-preview")
    .addEventListener("click", () => openModal("start"));
  document
    .getElementById("gradient-end-preview")
    .addEventListener("click", () => openModal("end"));

  cancelBtn.addEventListener("click", closeModal);
  okBtn.addEventListener("click", applyColor);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  ["start", "end"].forEach((type) => {
    const hexInput = document.getElementById(`gradient-${type}-hex`);
    hexInput.addEventListener("input", (e) => {
      const hex = e.target.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        const preview = document.getElementById(`gradient-${type}-preview`);
        preview.style.background = hex;
        updateColorPreview();
      }
    });
  });
}

// Color Conversion Utilities
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert HSV (Hue: 0-360, Saturation: 0-1, Value: 0-1) to RGB (0-255)
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Convert RGB (0-255) to HSV (Hue: 0-360, Saturation: 0-1, Value: 0-1)
function rgbToHsv(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : delta / max;
  let v = max;

  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
  }

  if (h < 0) h += 360;

  return { h, s, v };
}

function updateColorPreview() {
  const startColor = document.getElementById("gradient-start-hex").value;
  const endColor = document.getElementById("gradient-end-hex").value;

  const preview = document.getElementById("color-preview");
  preview.style.background = `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`;

  document.body.style.background = `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`;
  updateBuildingBlocksColors(startColor, endColor);
}

// File Upload Handlers
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileExtension = file.name.split(".").pop().toLowerCase();

  try {
    const content = await readFileContent(file);

    if (fileExtension === "csv") {
      uploadedCompetitors = parseCSV(content);
    } else if (fileExtension === "txt") {
      uploadedCompetitors = parseTXT(content);
    } else if (fileExtension === "xlsx") {
      await showAlert(
        "Please convert XLSX to CSV format for now. XLSX support coming soon!",
        "info",
        "XLSX Not Supported",
      );
      return;
    } else {
      await showAlert(
        "Unsupported file format. Please use CSV or TXT files.",
        "error",
        "Invalid File Type",
      );
      return;
    }

    if (uploadedCompetitors.length === 0) {
      await showAlert(
        "No valid competitors found in the file. Please check the format.",
        "warning",
        "No Competitors Found",
      );
      return;
    }

    const fileNameDisplay = document.getElementById("file-name");
    fileNameDisplay.textContent = `✓ ${uploadedCompetitors.length} competitors loaded`;
    fileNameDisplay.classList.add("loaded");

    console.log("Loaded competitors:", uploadedCompetitors);
  } catch (error) {
    console.error("Error reading file:", error);
    await showAlert(
      "Error reading file. Please check the file format.",
      "error",
      "File Error",
    );
  }
}

async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name;
  const fileExtension = fileName.split(".").pop().toLowerCase();

  if (!["png", "jpg", "jpeg", "svg", "gif"].includes(fileExtension)) {
    await showAlert(
      "Please upload a valid image file (PNG, JPG, SVG, GIF)",
      "error",
      "Invalid Image Type",
    );
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedLogoPath = e.target.result;
    document.getElementById("logo-name").textContent = `Selected: ${fileName}`;
    updateLogoPreview(uploadedLogoPath);
  };
  reader.readAsDataURL(file);
}

function updateLogoPreview(logoPath) {
  const preview = document.getElementById("logo-preview");

  if (logoPath) {
    preview.innerHTML = `<img src="${logoPath}" alt="Logo Preview">`;
  } else {
    preview.innerHTML =
      '<span class="logo-preview-placeholder">No logo uploaded</span>';
  }
}

// Template & Configuration

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

async function downloadTemplate() {
  try {
    const response = await fetch("data/sample-template.csv");

    if (!response.ok) {
      throw new Error("Failed to fetch template file");
    }

    const csvContent = await response.text();
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    await showAlert(
      "Template downloaded successfully!",
      "success",
      "Download Complete",
    );
  } catch (error) {
    console.error("Error downloading template:", error);
    await showAlert(
      "Error downloading template. Please check the console.",
      "error",
      "Download Failed",
    );
  }
}

async function saveConfiguration() {
  const gradientStart = document.getElementById("gradient-start-hex").value;
  const gradientEnd = document.getElementById("gradient-end-hex").value;

  if (!gradientStart || !gradientEnd) {
    await showAlert(
      "Please select gradient colors",
      "warning",
      "Missing Colors",
    );
    return;
  }

  if (uploadedCompetitors.length === 0) {
    await showAlert(
      "Please upload a competitors file before saving",
      "warning",
      "Missing Competitors",
    );
    return;
  }

  const config = {
    gradientStart,
    gradientEnd,
    competitors: uploadedCompetitors,
    logoPath: uploadedLogoPath,
    createdAt: new Date().toISOString(),
  };

  const saveSuccess = saveConfig(config);
  console.log("Save result:", saveSuccess);

  if (!saveSuccess) {
    await showAlert(
      "Failed to save configuration. This might be due to browser security settings with local files.<br><br>Please try running this on a web server instead.",
      "error",
      "Save Failed",
    );
    return;
  }

  const verifyConfig = loadConfig();
  console.log("Verification config:", verifyConfig);

  if (!verifyConfig) {
    await showAlert(
      "Error verifying saved configuration. Please try again.",
      "error",
      "Verification Failed",
    );
    return;
  }

  await showAlert(
    `Configuration saved successfully!<br><br><strong>${uploadedCompetitors.length} competitors</strong> loaded and ready for allocation.`,
    "success",
    "Configuration Saved",
  );

  window.location.href = "index.html";
}

async function resetConfiguration() {
  const confirmed = await showConfirm(
    "Are you sure you want to reset all configuration? This will clear all saved settings and cannot be undone.",
    "Reset Configuration",
    "Reset",
    "Cancel",
  );

  if (confirmed) {
    localStorage.removeItem("stationAllocationConfig");

    const defaultGradientStart = "#72d0eb";
    const defaultGradientEnd = "#0084ad";

    document.getElementById("gradient-start").value = defaultGradientStart;
    document.getElementById("gradient-start-hex").value = defaultGradientStart;
    document.getElementById("gradient-end").value = defaultGradientEnd;
    document.getElementById("gradient-end-hex").value = defaultGradientEnd;

    uploadedCompetitors = [];
    uploadedLogoPath = null;

    document.getElementById("file-name").textContent = "No file selected";
    document.getElementById("file-name").classList.remove("loaded");
    document.getElementById("logo-name").textContent =
      "No logo selected. Default logo will be used based on gradient colors.";

    document.getElementById("competitors-file").value = "";
    document.getElementById("logo-file").value = "";

    updateColorPreview();
    updateLogoPreview(null);

    await showAlert(
      "Configuration has been reset to defaults",
      "success",
      "Reset Complete",
    );
  }
}

async function goToAllocation() {
  const config = loadConfig();

  if (!config || !config.competitors || config.competitors.length === 0) {
    const confirmed = await showConfirm(
      "No configuration found. Would you like to save the current settings first?",
      "Configuration Required",
      "Save & Continue",
      "Cancel",
    );

    if (confirmed) {
      await saveConfiguration();
    }
  } else {
    window.location.href = "index.html";
  }
}

async function exportConfig() {
  const config = loadConfig();

  if (!config) {
    await showAlert(
      "No configuration to export. Please set up first.",
      "warning",
      "No Configuration",
    );
    return;
  }

  const jsonContent = JSON.stringify(config, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);

  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `config-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  await showAlert(
    "Configuration exported successfully!",
    "success",
    "Export Complete",
  );
}

async function importConfig() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const content = await readFileContent(file);
      const config = JSON.parse(content);

      if (!config.competitors || !Array.isArray(config.competitors)) {
        throw new Error("Invalid configuration format");
      }

      saveConfig(config);
      populateFormWithConfig(config);

      await showAlert(
        `Configuration imported successfully!<br><strong>${config.competitors.length} competitors</strong> loaded.`,
        "success",
        "Import Complete",
      );
    } catch (error) {
      console.error("Import error:", error);
      await showAlert(
        "Error importing configuration. Invalid JSON file.",
        "error",
        "Import Failed",
      );
    }
  };

  input.click();
}

document.addEventListener("DOMContentLoaded", initializeSetup);
