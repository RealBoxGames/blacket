export class StaffPunishmentEntity {
    id: number;
    userId: string;
    type: string;
    reason: string;
    expiresAt: Date;
    staffId: string;
    createdAt: Date;

    constructor(partial: Partial<StaffPunishmentEntity>) {
        Object.assign(this, partial);
    }
}

export default StaffPunishmentEntity;
