export class StaffBoosterEntity {
    id: number;
    type: string;
    multiplier: number;
    solo: boolean;
    expiresAt: Date;
    createdAt: Date;

    constructor(partial: Partial<StaffBoosterEntity>) {
        Object.assign(this, partial);
    }
}

export default StaffBoosterEntity;
