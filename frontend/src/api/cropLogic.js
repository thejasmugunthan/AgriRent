// src/utils/cropLogic.js
const CROP_MACHINE_MAP = {
  Rice: ["Tractor", "Rotavator", "Transplanter"],
  Wheat: ["Tractor", "Seeder", "Harvester"],
  Sugarcane: ["Harvester", "Tractor"],
  Maize: ["Tractor", "Planter", "Harvester"],
  Cotton: ["Tractor", "Sprayer", "Harvesting Machine"],
  Vegetables: ["Tractor", "Rotavator", "Sprayer"]
};

// Seasonal demand
const SEASON_MULTIPLIER = {
  Summer: 0.95,
  Monsoon: 1.05,
  Winter: 1.00,
  Harvest: 1.20
};

// Crop importance baseline
const CROP_BASE_DEMAND = {
  Rice: 1.0,
  Wheat: 0.95,
  Sugarcane: 0.9,
  Maize: 0.9,
  Cotton: 0.85,
  Vegetables: 1.05
};

/**
 * getCropInfo
 * @param {string} crop - crop name
 * @param {string} season - season
 * @returns {object} { recommendedMachines: [], demandMultiplier, notes }
 */
export function getCropInfo(crop = "Rice", season = "Monsoon") {
  const recommendedMachines = CROP_MACHINE_MAP[crop] || ["Tractor"];
  const base = CROP_BASE_DEMAND[crop] || 0.9;
  const seasonMult = SEASON_MULTIPLIER[season] ?? 1.0;

  const demandMultiplier = Number((base * seasonMult).toFixed(2));

  let notes = `Recommended: ${recommendedMachines.join(", ")}. `;
  notes += `Season factor: ${seasonMult}.`;

  return { recommendedMachines, demandMultiplier, notes };
}
