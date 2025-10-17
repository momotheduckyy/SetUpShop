//simple standin for equipment model before we link it to backend

export class Equipment {
  id: number;
  name: string;
  x: number;
  y: number;
  widthFt: number;
  depthFt: number;
  color: string;

  constructor(
    name: string, 
    x = 0,
    y = 0,
    widthFt = 2,
    depthFt = 2,
    color = "white"
  ) {

    this.id = Date.now();
    this.name = name;
    this.x = x;
    this.y = y;
    this.widthFt = widthFt;
    this.depthFt = depthFt;
    this.color = color;
  }

  moveTo(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}