// frontend/src/lib/models/Shop.test.js
import { describe, it, expect } from "vitest";
import { Shop } from "./Shop";

describe("Shop.moveEquipment", () => {
  it("updates the x and y coordinates of an equipment object when moved", () => {
    // Arrange: make a shop and add a piece of equipment
    const shop = new Shop("Test Shop", 20, 20, 10); // width/depth/scale values not critical here

    const config = {
      name: "Table Saw",
      widthFt: 3,
      depthFt: 2,
      color: "#aaa",
      // backend id (optional)
      equipment_id: 2,
    };

    const initialX = 5;
    const initialY = 7;

    const equipment = shop.addEquipment(config, initialX, initialY);

    // Sanity check initial position
    expect(equipment.x).toBe(initialX);
    expect(equipment.y).toBe(initialY);

    // Act: move the equipment
    const newX = 12;
    const newY = 15;
    shop.moveEquipment(equipment.id, newX, newY);

    // Assert: coordinates are updated
    const movedEquipment = shop.getEquipmentById(equipment.id);
    expect(movedEquipment).not.toBeNull();
    expect(movedEquipment.x).toBe(newX);
    expect(movedEquipment.y).toBe(newY);
  });
});
