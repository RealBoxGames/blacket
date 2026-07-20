import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Forbidden } from "@blacket/types";
import { OWNER_TIER_GROUPS } from "./constants";

@Injectable()
export class OwnerTierService {
    constructor(private readonly prismaService: PrismaService) {}

    async assert(userId: string): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { groups: { select: { name: true } } }
        });

        const isOwnerTier = user?.groups.some((group) => OWNER_TIER_GROUPS.includes(group.name)) ?? false;
        if (!isOwnerTier) throw new ForbiddenException(Forbidden.STAFF_ONLY_OWNER);
    }
}
