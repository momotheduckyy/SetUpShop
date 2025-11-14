// frontend/src/lib/models/Shop.js
import { Equipment } from "./Equipment";

export class Shop {
  constructor(name, widthFt, depthFt, pixelsPerFoot = 10) {
    this.name = name;
    this.widthFt = widthFt;
    this.depthFt = depthFt;
    this.pixelsPerFoot = pixelsPerFoot;
    this.equipment_list = [];
    this._nextId = 0;
  }

  toPixels(feet) {
    return feet * this.pixelsPerFoot;
  }

  addEquipment(config, x, y) {
    const eq = new Equipment({
      id: this._nextId++,
      name: config.name,
      widthFt: config.widthFt ?? 3,
      depthFt: config.depthFt ?? 3,
      color: config.color ?? "#aaa",
      x,
      y,
      rotationDeg: 0,
      manufacturer: config.manufacturer ?? "",
      model: config.model ?? "",
      make: config.make ?? "",
      maintenanceIntervalDays: config.maintenanceIntervalDays ?? null,
      maintenanceNotes: config.maintenanceNotes ?? "",
    });

    this.equipment_list.push(eq);
    return eq;
  }

  moveEquipment(id, x, y) {
    const eq = this.equipment_list.find((e) => e.id === id);
    if (!eq) return;
    eq.x = x;
    eq.y = y;
  }

  rotateEquipment(id, deltaDeg) {
    const eq = this.equipment_list.find((e) => e.id === id);
    if (!eq) return;
    eq.rotate(deltaDeg);
  }

  getEquipmentById(id) {
    return this.equipment_list.find((e) => e.id === id) || null;
  }
}
