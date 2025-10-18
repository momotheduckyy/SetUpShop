import { Equipment } from "./Equipment";

export interface EquipmentConfig {
    name: string;
    widthFt: number;
    depthFt: number;
    color: string;
    }

export class EquipmentFactory {
    static create(config: EquipmentConfig, x: number, y: number): Equipment {
        const { name, widthFt, depthFt, color } = config;
        return new Equipment(
            name,
            x,
            y,
            widthFt,
            depthFt
        );
    }
}
