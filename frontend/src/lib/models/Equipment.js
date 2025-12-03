export class Equipment {
  constructor({
    id,
    equipmentDbId = null,  // ✅ DB user_equipment.id, if any
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
    maintenanceIntervalDays = null,
    maintenanceNotes = "",
  }) {
    this.id = id;                    // local canvas id
    this.equipmentDbId = equipmentDbId; // DB id for /shops/:id/equipment calls

    this.name = name;
    this.widthFt = widthFt;
    this.depthFt = depthFt;
    this.color = color;
    this.x = x;
    this.y = y;
    this.rotationDeg = rotationDeg;

    this.manufacturer = manufacturer;
    this.model = model;
    this.make = make;
    this.maintenanceIntervalDays = maintenanceIntervalDays;
    this.maintenanceNotes = maintenanceNotes;
  }

  rotate(deltaDeg) {
    this.rotationDeg = (this.rotationDeg + deltaDeg) % 360;
  }
}
