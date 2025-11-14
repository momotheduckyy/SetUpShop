import { MaintenanceTask } from "./MaintenanceTask";

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
    maintenanceTasks = [],
  }) {
    this.id = id;
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

    // Convert plain objects into MaintenanceTask instances
    this.maintenanceTasks = maintenanceTasks.map(
      (task) => new MaintenanceTask(task)
    );
  }

  rotate(deltaDeg) {
    this.rotationDeg = (this.rotationDeg + deltaDeg) % 360;
  }

  addMaintenanceTask(taskObj) {
    this.maintenanceTasks.push(new MaintenanceTask(taskObj));
  }

  markTaskComplete(taskIndex) {
    if (this.maintenanceTasks[taskIndex]) {
      this.maintenanceTasks[taskIndex].markComplete();
    }
  }
}
