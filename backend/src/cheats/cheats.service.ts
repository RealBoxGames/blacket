import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { SocketService } from "src/socket/socket.service";
import { CHEATS_USER_ID } from "src/core/constants";
import {
    CheatsGiveDto,
    CheatsTriggerEventDto,
    Forbidden,
    NotFound,
    StaffUserEntity,
    SocketMessageType
} from "@blacket/types";
import { BlookObtainMethod } from "@blacket/core";

const USER_SELECT = {
    id: true,
    username: true,
    tokens: true,
    diamonds: true,
    crystals: true,
    createdAt: true,
    avatar: { select: { blookId: true, shiny: true } },
    groups: { select: { id: true, name: true, priority: true } }
};

@Injectable()
export class CheatsService {
    constructor(private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
        private readonly socketService: SocketService,) {}

    assert(userId: string): void {
        if (userId !== CHEATS_USER_ID) throw new ForbiddenException(Forbidden.STAFF_ONLY_OWNER);
    }

    async listUsers(requesterId: string, search?: string): Promise<{ total: number; users: StaffUserEntity[] }> {
        this.assert(requesterId);

        const [total, users] = await Promise.all([
            this.prismaService.user.count({ where: { deletedAt: null } }),
            this.prismaService.user.findMany({
                where: {
                    deletedAt: null,
                    ...(search ? { username: { contains: search, mode: "insensitive" } } : {})
                },
                select: USER_SELECT,
                orderBy: { createdAt: "desc" },
                take: 100
            })
        ]);

        return {
            total,
            users: users.map((user) => new StaffUserEntity({
                id: user.id,
                username: user.username,
                tokens: user.tokens,
                diamonds: user.diamonds,
                crystals: user.crystals,
                createdAt: user.createdAt,
                avatarBlookId: user.avatar?.blookId ?? null,
                avatarShiny: user.avatar?.shiny ?? false,
                groups: user.groups
            }))
        };
    }

    async give(requesterId: string, dto: CheatsGiveDto): Promise<void> {
        this.assert(requesterId);

        const user = await this.prismaService.user.findUnique({ where: { id: dto.targetUserId }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        const currencyUpdate: Record<string, { increment: number }> = {};
        if (dto.tokens) currencyUpdate.tokens = { increment: dto.tokens };
        if (dto.diamonds) currencyUpdate.diamonds = { increment: dto.diamonds };
        if (dto.crystals) currencyUpdate.crystals = { increment: dto.crystals };
        if (dto.experience) currencyUpdate.experience = { increment: dto.experience };

        if (Object.keys(currencyUpdate).length > 0) {
            await this.prismaService.user.update({ where: { id: dto.targetUserId }, data: currencyUpdate });
        }

        if (dto.groupId) {
            const group = await this.prismaService.group.findUnique({ where: { id: dto.groupId }, select: { id: true } });
            if (!group) throw new NotFoundException(NotFound.UNKNOWN_GROUP);

            await this.prismaService.user.update({
                where: { id: dto.targetUserId },
                data: { groups: { connect: { id: dto.groupId } } }
            });
        }

        if (dto.blookId) {
            const blook = await this.redisService.getBlook(dto.blookId);
            if (!blook) throw new NotFoundException(NotFound.UNKNOWN_BLOOK);

            const shiny = dto.shiny ?? false;
            const last = await this.prismaService.userBlook.findFirst({
                where: { blookId: dto.blookId, shiny },
                orderBy: { serial: "desc" },
                select: { serial: true }
            });

            await this.prismaService.userBlook.create({
                data: {
                    userId: dto.targetUserId,
                    initialObtainerId: dto.targetUserId,
                    blookId: dto.blookId,
                    shiny,
                    obtainedBy: BlookObtainMethod.STAFF,
                    serial: (last?.serial ?? 0) + 1
                }
            });
        }

        this.socketService.emitUserRefetchMeEvent(dto.targetUserId);
    }

    triggerEvent(requesterId: string, dto: CheatsTriggerEventDto): void {
        this.assert(requesterId);

        this.socketService.emitToAll(SocketMessageType.CHEATS_EVENT, {
            visual: dto.visual ?? "none",
            text: dto.text ?? null,
            durationSeconds: dto.durationSeconds ?? 8
        });
    }
}
