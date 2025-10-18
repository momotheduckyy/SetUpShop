//stand in for equipment catalog data before we link it to backend

import { EquipmentConfig } from "../models/EquipmentFactory";

export const equipmentCatalog: EquipmentConfig[] = [
  { name: "Table Saw", widthFt: 6, depthFt: 3, color: "green" },
  { name: "Band Saw", widthFt: 3, depthFt: 3, color: "yellow" },
  { name: "Drill Press", widthFt: 2, depthFt: 2, color: "blue" },
];
