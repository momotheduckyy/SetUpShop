// frontend/src/lib/models/Equipment.js

export class Equipment {
  constructor({
    id,
    name,
    widthFt,
    depthFt,
    color = "#aaa",
    x,
    y,
    rotationDeg = 0,
    manufacturer = "",
    model = "",
    make = "",
    description = "",
    maintenanceIntervalDays = null,
    maintenanceNotes = "",
    equipmentDbId = null,
  }) {
    this.id = id;
    this.name = name;
    this.widthFt = widthFt;
    this.depthFt = depthFt;
    this.color = color;
    this.x = x; // canvas center x in pixels
    this.y = y; // canvas center y in pixels
    this.rotationDeg = rotationDeg;

    // richer metadata
    this.manufacturer = manufacturer;
    this.model = model;
    this.make = make;
    this.description = description;
    this.maintenanceIntervalDays = maintenanceIntervalDays;
    this.maintenanceNotes = maintenanceNotes;

    // Database ID for persistence
    this.equipmentDbId = equipmentDbId;
  }

  rotate(deltaDeg) {
    this.rotationDeg = (this.rotationDeg + deltaDeg) % 360;
  }
}
