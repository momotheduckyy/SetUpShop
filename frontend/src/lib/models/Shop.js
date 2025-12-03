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
    color: config.color ?? "#aaa",
    x,
    y,
    rotationDeg: config.rotationDeg ?? 0,

    // Keep reference to backend id (user_equipment.id) if present
    // Priority:
    // 1) explicit equipmentDbId
    // 2) equipment_id from placement JSON
    // 3) id from userEquipment list (DB id when dragging from sidebar)
    equipmentDbId:
      config.equipmentDbId ??
      config.equipment_id ??
      config.id ??
      null,

    manufacturer: config.manufacturer ?? "",
    model: config.model ?? "",
    maintenanceIntervalDays: config.maintenanceIntervalDays ?? null,
    maintenanceNotes: config.maintenanceNotes ?? "",
  });

  this.equipment_list.push(equipment);
  return equipment;
}


  rotateEquipment(id, deltaDeg) {
    const eq = this.getEquipmentById(id);
    if (!eq) return;
    eq.rotate(deltaDeg);
  }

  moveEquipment(id, newX, newY) {
    const eq = this.getEquipmentById(id);
    if (!eq) return;
    eq.x = newX;
    eq.y = newY;
  }

  removeEquipmentById(id) {
    this.equipment_list = this.equipment_list.filter((eq) => eq.id !== id);
  }

  getEquipmentById(id) {
    return this.equipment_list.find((e) => e.id === id) || null;
  }
}
