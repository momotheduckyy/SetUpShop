// frontend/src/lib/models/Shop.js
import { Equipment } from "./Equipment";

export class Shop {
  constructor(name, widthFt, depthFt, scale) {
    this.name = name;
    this.widthFt = widthFt;
    this.depthFt = depthFt;
    this.scale = scale;
    this.equipment_list = [];
    this._nextLocalId = 1;
  }

  toPixels(ft) {
    return ft * this.scale;
  }

  addEquipment(config, x, y) {
    const equipment = new Equipment({
      // local id used only for canvas selection
      id: this._nextLocalId++,
      name: config.name,
      widthFt: config.widthFt,
      depthFt: config.depthFt,
      color: config.color,
      x,
      y,
      rotationDeg: 0,

      // 🔑 Keep a reference to backend equipment id if present
      equipmentDbId: config.equipment_id || config.id || null,
      manufacturer: config.manufacturer,
      model: config.model,
      maintenanceIntervalDays: config.maintenanceIntervalDays,
      maintenanceNotes: config.maintenanceNotes,
    });

    this.equipment_list.push(equipment);
    return equipment; // 👈 useful when we want the instance back
  }

  rotateEquipment(id, deltaDeg) {
    const eq = this.getEquipmentById(id);
    if (!eq) return;
    eq.rotate(deltaDeg);
  }

  getEquipmentById(id) {
    return this.equipment_list.find((e) => e.id === id) || null;
  }
}
