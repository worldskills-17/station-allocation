/**
 * WorldSkills Station Allocation - Utility Functions
 * Shared utilities for seeding, randomization, and helpers
 */

/**
 * Seeded random number generator
 * Provides deterministic random numbers based on a seed
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Create hash from string
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with seeded random
 * @param {Array} array - Array to shuffle
 * @param {SeededRandom} rng - Random number generator
 * @returns {Array} - Shuffled array
 */
function seededShuffle(array, rng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Load configuration from localStorage or file
 * @returns {Object|null} - Configuration object or null
 */
function loadConfig() {
  try {
    const configString = localStorage.getItem("stationAllocationConfig");

    if (!configString) {
      return null;
    }

    const config = JSON.parse(configString);
    return config;
  } catch (error) {
    console.error("Error loading configuration:", error);
    return null;
  }
}

/**
 * Save configuration to localStorage
 * @param {Object} config - Configuration object
 * @returns {boolean} - Success status
 */
function saveConfig(config) {
  try {
    const configString = JSON.stringify(config);
    localStorage.setItem("stationAllocationConfig", configString);

    // Verify save
    const saved = localStorage.getItem("stationAllocationConfig");
    if (saved) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Apply theme colors to CSS variables
 * @param {string} gradientStart - Gradient start color
 * @param {string} gradientEnd - Gradient end color
 */
function applyTheme(gradientStart, gradientEnd) {
  const root = document.documentElement;
  root.style.setProperty("--gradient-start", gradientStart);
  root.style.setProperty("--gradient-end", gradientEnd);
}

/**
 * Calculate brightness of a color to determine if logo should be light or dark
 * @param {string} hex - Hex color code
 * @returns {string} - 'light' or 'dark'
 */
function getLogoBrightness(hex) {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance (using standard formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // If luminance is high (light background), return 'dark' for dark logo
  // If luminance is low (dark background), return 'light' for light logo
  return luminance > 0.6 ? "dark" : "light";
}

/**
 * Parse CSV content
 * @param {string} content - CSV content
 * @returns {Array} - Array of competitor objects
 */
function parseCSV(content) {
  const lines = content.trim().split("\n");
  const competitors = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      competitors.push({
        firstName: parts[0],
        lastName: parts[1],
        countryCode: parts[2],
      });
    }
  }

  return competitors;
}

/**
 * Parse TXT content (space-separated)
 * @param {string} content - TXT content
 * @returns {Array} - Array of competitor objects
 */
function parseTXT(content) {
  const lines = content.trim().split("\n");
  const competitors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue; // Skip empty lines and comments

    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      competitors.push({
        firstName: parts[0],
        lastName: parts.slice(1, -1).join(" "), // Handle multi-word last names
        countryCode: parts[parts.length - 1],
      });
    }
  }

  return competitors;
}

/**
 * Generate SVG building blocks decoration (WorldSkills brand style interconnected cubes)
 * @param {string} position - 'left' or 'right'
 * @param {string} gradientStart - Optional gradient start color
 * @param {string} gradientEnd - Optional gradient end color
 * @returns {string} - SVG markup
 */
function generateBuildingBlocks(
  position,
  gradientStart = "#72d0eb",
  gradientEnd = "#0084ad",
) {
  const cubes = [];
  const cubeSize = 120; // Much bigger cubes

  // Helper function to darken a hex color
  function darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - percent)));
    const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent)));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  // Create isometric cube helper function
  function createIsometricCube(x, y, size, colorIndex) {
    const baseColor = colorIndex === 0 ? gradientStart : gradientEnd;
    const colors = [
      {
        top: baseColor,
        left: darkenColor(baseColor, 0.15),
        right: darkenColor(baseColor, 0.25),
      },
      {
        top: baseColor,
        left: darkenColor(baseColor, 0.15),
        right: darkenColor(baseColor, 0.25),
      },
    ];

    const color = colors[colorIndex % colors.length];
    const h = size / 2;

    // Isometric cube faces
    const topPoints = `${x},${y} ${x + h},${y - h / 2} ${x + h * 2},${y} ${x + h},${y + h / 2}`;
    const leftPoints = `${x},${y} ${x + h},${y + h / 2} ${x + h},${y + h / 2 + h} ${x},${y + h}`;
    const rightPoints = `${x + h},${y + h / 2} ${x + h * 2},${y} ${x + h * 2},${y + h} ${x + h},${y + h / 2 + h}`;

    return `
      <g opacity="0.3">
        <polygon points="${topPoints}" fill="${color.top}" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
        <polygon points="${leftPoints}" fill="${color.left}" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <polygon points="${rightPoints}" fill="${color.right}" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      </g>
    `;
  }

  // Create interconnected stacked structures (like WorldSkills brand)
  function createCubeStructure(baseX, baseY, pattern) {
    const structure = [];
    const h = cubeSize / 2;

    pattern.forEach((row, rowIndex) => {
      row.forEach((colorIndex, colIndex) => {
        if (colorIndex !== null) {
          const x = baseX + colIndex * h * 2;
          const y = baseY + rowIndex * h - (colIndex * h) / 2;
          structure.push(createIsometricCube(x, y, cubeSize, colorIndex));
        }
      });
    });

    return structure.join("");
  }

  // Wider, more balanced patterns (avoiding tall vertical towers)
  const structures =
    position === "left"
      ? [
          // Structure 1: L-shape
          {
            x: 0,
            y: 150,
            pattern: [
              [0, 1],
              [0, null],
            ],
          },
          // Structure 2: Horizontal blocks
          { x: 0, y: 400, pattern: [[1, 0, 1]] },
        ]
      : [
          // Structure 1: Pyramid
          {
            x: 20,
            y: 150,
            pattern: [
              [null, 0],
              [1, 0],
            ],
          },
          // Structure 2: Wide block
          {
            x: 0,
            y: 400,
            pattern: [
              [0, 1],
              [1, 0],
            ],
          },
        ];

  structures.forEach((struct) => {
    cubes.push(createCubeStructure(struct.x, struct.y, struct.pattern));
  });

  return `
    <svg width="350" height="650" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 650">
      ${cubes.join("")}
    </svg>
  `;
}

/**
 * Create building blocks background elements
 * @param {string} gradientStart - Optional gradient start color
 * @param {string} gradientEnd - Optional gradient end color
 */
function createBuildingBlocksBackground(gradientStart, gradientEnd) {
  const leftBlocks = document.createElement("div");
  leftBlocks.className = "building-blocks-left";
  leftBlocks.innerHTML = generateBuildingBlocks(
    "left",
    gradientStart,
    gradientEnd,
  );

  const rightBlocks = document.createElement("div");
  rightBlocks.className = "building-blocks-right";
  rightBlocks.innerHTML = generateBuildingBlocks(
    "right",
    gradientStart,
    gradientEnd,
  );

  document.body.insertBefore(leftBlocks, document.body.firstChild);
  document.body.insertBefore(rightBlocks, document.body.firstChild);
}

/**
 * Update building blocks background colors
 * @param {string} gradientStart - Gradient start color
 * @param {string} gradientEnd - Gradient end color
 */
function updateBuildingBlocksColors(gradientStart, gradientEnd) {
  const leftBlocks = document.querySelector(".building-blocks-left");
  const rightBlocks = document.querySelector(".building-blocks-right");

  if (leftBlocks) {
    leftBlocks.innerHTML = generateBuildingBlocks(
      "left",
      gradientStart,
      gradientEnd,
    );
  }
  if (rightBlocks) {
    rightBlocks.innerHTML = generateBuildingBlocks(
      "right",
      gradientStart,
      gradientEnd,
    );
  }
}

/**
 * Custom Modal System
 */

// Create modal container if it doesn't exist
function createModalContainer() {
  if (document.getElementById("custom-modal")) {
    return document.getElementById("custom-modal");
  }

  const modal = document.createElement("div");
  modal.id = "custom-modal";
  modal.className = "modal-overlay";
  document.body.appendChild(modal);
  return modal;
}

/**
 * Show custom alert modal
 * @param {string} message - Message to display
 * @param {string} type - Type of alert (success, error, warning, info)
 * @param {string} title - Optional title
 * @returns {Promise} - Resolves when user clicks OK
 */
function showAlert(message, type = "info", title = "") {
  return new Promise((resolve) => {
    const modal = createModalContainer();

    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    const titles = {
      success: title || "Success",
      error: title || "Error",
      warning: title || "Warning",
      info: title || "Information",
    };

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon ${type}">
            ${icons[type]}
          </div>
          <h3 class="modal-title">${titles[type]}</h3>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-primary" id="modal-ok-btn">OK</button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    // Handle OK button click
    const okButton = modal.querySelector("#modal-ok-btn");
    const closeHandler = () => {
      modal.classList.remove("show");
      resolve();
    };

    okButton.addEventListener("click", closeHandler);

    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeHandler();
      }
    };
  });
}

/**
 * Show custom confirm modal
 * @param {string} message - Message to display
 * @param {string} title - Optional title
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @returns {Promise<boolean>} - Resolves with true/false based on user choice
 */
function showConfirm(
  message,
  title = "Confirm",
  confirmText = "Confirm",
  cancelText = "Cancel",
) {
  return new Promise((resolve) => {
    const modal = createModalContainer();

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon warning">
            ⚠
          </div>
          <h3 class="modal-title">${title}</h3>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-secondary" id="modal-cancel-btn">
            ${cancelText}
          </button>
          <button class="modal-button modal-button-danger" id="modal-confirm-btn">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    modal.classList.add("show");

    // Get button elements
    const confirmButton = modal.querySelector("#modal-confirm-btn");
    const cancelButton = modal.querySelector("#modal-cancel-btn");

    // Handle confirm button click
    confirmButton.addEventListener("click", () => {
      modal.classList.remove("show");
      resolve(true);
    });

    // Handle cancel button click
    cancelButton.addEventListener("click", () => {
      modal.classList.remove("show");
      resolve(false);
    });

    // Close on overlay click (counts as cancel)
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        resolve(false);
      }
    };
  });
}

// Export functions for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SeededRandom,
    hashString,
    seededShuffle,
    loadConfig,
    saveConfig,
    applyTheme,
    getLogoBrightness,
    parseCSV,
    parseTXT,
    generateBuildingBlocks,
    createBuildingBlocksBackground,
    showAlert,
    showConfirm,
  };
}
