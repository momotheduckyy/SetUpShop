
export class ShopSize {
  constructor({ lengthFt, widthFt, heightFt, shapeType = "rectangle", vertices = [] }) {
    this.lengthFt = lengthFt;
    this.widthFt = widthFt;
    this.heightFt = heightFt;

    // future-friendly
    this.shapeType = shapeType; // "rectangle", "polygon", etc.
    this.vertices = vertices;   // e.g. [{ x, y }, ...] for more complex rooms later
  }

  toPayload() {
    return {
      length: this.lengthFt,
      width: this.widthFt,
      height: this.heightFt,
      shapeType: this.shapeType,
      vertices: this.vertices,
    };
  }
}
