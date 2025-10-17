import { Equipment } from "./Equipment";
import { EquipmentFactory, EquipmentConfig } from "./EquipmentFactory";

export class Shop {
    id: string;
    name: string;
  widthFt: number;
  depthFt: number;
  scale: number;
  equipment_list: Equipment[];

  constructor(name: string, widthFt: number, depthFt: number, scale: number) {
    // Initialize shop properties
    this.id = Date.now().toString();    //Ben has another solution for the ID
    this.name = name;
    this.widthFt = widthFt;
    this.depthFt = depthFt;
    this.scale = scale;
    this.equipment_list = [];
  }

  addEquipment(config: EquipmentConfig, x: number, y: number) {
    const item = EquipmentFactory.create(config, x, y);     //call the factory to create equipment
    this.equipment_list.push(item);
    return item;
  }

  moveEquipment(id: number, x: number, y: number) {
    const eq = this.equipment_list.find((e) => e.id === id);
    if (eq) eq.moveTo(x, y);
  }

  toPixels(ft: number) {
    return ft * this.scale;
  }

  toFeet(px: number) {
    return px / this.scale;
  }
}
