import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { PermissionsService } from "src/permissions/permissions.service";
import { OWNER_TIER_GROUPS } from "src/core/constants";
import {
    Forbidden,
    NotFound,
    StaffAdminEditUserCurrencyDto,
    StaffAdminEditUserGroupsDto,
    StaffAdminGiveTokensDto,
    StaffAdminGiveUserBlookDto,
    StaffAdminPunishUserDto,
    StaffAdminSetUserAvatarDto,
    StaffPunishmentEntity,
    StaffUserEntity
} from "@blacket/types";
import { BlookObtainMethod, PermissionType, PunishmentType } from "@blacket/core";

const PERMANENT_DURATION_MS = 1000 * 60 * 60 * 24 * 365 * 100;

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
export class StaffService {
    constructor(private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
        private readonly permissionsService: PermissionsService,) {}

    private toEntity(user: any): StaffUserEntity {
        return new StaffUserEntity({
            id: user.id,
            username: user.username,
            tokens: user.tokens,
            diamonds: user.diamonds,
            crystals: user.crystals,
            createdAt: user.createdAt,
            avatarBlookId: user.avatar?.blookId ?? null,
            avatarShiny: user.avatar?.shiny ?? false,
            groups: user.groups
        });
    }

    private async assertIsOwnerOrDeveloper(userId: string): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { groups: { select: { name: true } } }
        });

        const isOwnerTier = user?.groups.some((group) => OWNER_TIER_GROUPS.includes(group.name)) ?? false;
        if (!isOwnerTier) throw new ForbiddenException(Forbidden.STAFF_ONLY_OWNER);
    }

    private async assertHasPermission(userId: string, permission: PermissionType): Promise<void> {
        const permissions = await this.permissionsService.getUserPermissions(userId);
        if (!this.permissionsService.hasPermission(permissions, permission)) throw new ForbiddenException(Forbidden.DEFAULT);
    }

    // Minimal user lookup for the Moderation page - usable by Helper/Moderator/Admin too,
    // so it deliberately excludes currency/groups (that stays behind MANAGE_DATA in searchUsers).
    async searchUsersForModeration(search?: string): Promise<{ id: string; username: string }[]> {
        return await this.prismaService.user.findMany({
            where: search ? { username: { contains: search, mode: "insensitive" } } : {},
            select: { id: true, username: true },
            orderBy: { createdAt: "desc" },
            take: 50
        });
    }

    async searchUsers(search?: string): Promise<StaffUserEntity[]> {
        const users = await this.prismaService.user.findMany({
            where: search ? { username: { contains: search, mode: "insensitive" } } : {},
            select: USER_SELECT,
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return users.map((user) => this.toEntity(user));
    }

    async getUser(id: string): Promise<StaffUserEntity> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            select: USER_SELECT
        });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        return this.toEntity(user);
    }

    async editCurrency(id: string, dto: StaffAdminEditUserCurrencyDto): Promise<StaffUserEntity> {
        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        await this.prismaService.user.update({
            where: { id },
            data: {
                ...(dto.tokens !== undefined ? { tokens: dto.tokens } : {}),
                ...(dto.diamonds !== undefined ? { diamonds: dto.diamonds } : {}),
                ...(dto.crystals !== undefined ? { crystals: dto.crystals } : {})
            }
        });

        return this.getUser(id);
    }

    private async nextSerial(blookId: number, shiny: boolean): Promise<number> {
        const last = await this.prismaService.userBlook.findFirst({
            where: { blookId, shiny },
            orderBy: { serial: "desc" },
            select: { serial: true }
        });

        return (last?.serial ?? 0) + 1;
    }

    async giveBlook(id: string, dto: StaffAdminGiveUserBlookDto) {
        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        const blook = await this.redisService.getBlook(dto.blookId);
        if (!blook) throw new NotFoundException(NotFound.UNKNOWN_BLOOK);

        const shiny = dto.shiny ?? false;
        const serial = await this.nextSerial(dto.blookId, shiny);

        return await this.prismaService.userBlook.create({
            data: {
                userId: id,
                initialObtainerId: id,
                blookId: dto.blookId,
                shiny,
                obtainedBy: BlookObtainMethod.STAFF,
                serial
            }
        });
    }

    async setAvatar(id: string, dto: StaffAdminSetUserAvatarDto): Promise<StaffUserEntity> {
        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        const blook = await this.redisService.getBlook(dto.blookId);
        if (!blook) throw new NotFoundException(NotFound.UNKNOWN_BLOOK);

        const shiny = dto.shiny ?? false;
        const serial = await this.nextSerial(dto.blookId, shiny);

        const userBlook = await this.prismaService.userBlook.create({
            data: {
                userId: id,
                initialObtainerId: id,
                blookId: dto.blookId,
                shiny,
                obtainedBy: BlookObtainMethod.STAFF,
                serial
            }
        });

        await this.prismaService.user.update({
            where: { id },
            data: {
                avatar: { connect: { id: userBlook.id } },
                customAvatar: { disconnect: true }
            }
        });

        return this.getUser(id);
    }

    async listGroups() {
        return await this.prismaService.group.findMany({
            select: { id: true, name: true, priority: true },
            orderBy: { priority: "desc" }
        });
    }

    async editGroups(requesterId: string, id: string, dto: StaffAdminEditUserGroupsDto): Promise<StaffUserEntity> {
        await this.assertIsOwnerOrDeveloper(requesterId);

        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        const groups = await this.prismaService.group.findMany({ where: { id: { in: dto.groupIds } }, select: { id: true } });
        if (groups.length !== dto.groupIds.length) throw new NotFoundException(NotFound.UNKNOWN_GROUP);

        await this.prismaService.user.update({
            where: { id },
            data: {
                groups: { set: dto.groupIds.map((groupId) => ({ id: groupId })) }
            }
        });

        return this.getUser(id);
    }

    async giveTokens(requesterId: string, dto: StaffAdminGiveTokensDto): Promise<{ username: string; tokens: number }> {
        await this.assertIsOwnerOrDeveloper(requesterId);

        const user = await this.prismaService.user.findFirst({
            where: { username: { equals: dto.username, mode: "insensitive" } },
            select: { id: true, username: true }
        });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        await this.prismaService.user.update({
            where: { id: user.id },
            data: { tokens: { increment: dto.tokens } }
        });

        return { username: user.username, tokens: dto.tokens };
    }

    private permissionForPunishmentType(type: PunishmentType): PermissionType {
        if (type === PunishmentType.BAN) return PermissionType.BAN_USERS;
        if (type === PunishmentType.BLACKLIST) return PermissionType.BLACKLIST_USERS;
        return PermissionType.MUTE_USERS;
    }

    async punishUser(requesterId: string, id: string, dto: StaffAdminPunishUserDto): Promise<StaffPunishmentEntity> {
        const requiredPermission = dto.type === "BAN" ? PermissionType.BAN_USERS : PermissionType.MUTE_USERS;
        await this.assertHasPermission(requesterId, requiredPermission);

        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        const expiresAt = dto.durationMinutes
            ? new Date(Date.now() + dto.durationMinutes * 60 * 1000)
            : new Date(Date.now() + PERMANENT_DURATION_MS);

        const punishment = await this.prismaService.punishment.create({
            data: {
                userId: id,
                staffId: requesterId,
                type: dto.type === "BAN" ? PunishmentType.BAN : PunishmentType.MUTE,
                reason: dto.reason,
                expiresAt
            }
        });

        return new StaffPunishmentEntity(punishment);
    }

    async listPunishments(requesterId: string, id: string): Promise<StaffPunishmentEntity[]> {
        const permissions = await this.permissionsService.getUserPermissions(requesterId);
        const canView = this.permissionsService.hasPermission(permissions, PermissionType.BAN_USERS) ||
            this.permissionsService.hasPermission(permissions, PermissionType.MUTE_USERS) ||
            this.permissionsService.hasPermission(permissions, PermissionType.BLACKLIST_USERS);
        if (!canView) throw new ForbiddenException(Forbidden.DEFAULT);

        const punishments = await this.prismaService.punishment.findMany({
            where: { userId: id },
            orderBy: { createdAt: "desc" }
        });

        return punishments.map((punishment) => new StaffPunishmentEntity(punishment));
    }

    async revokePunishment(requesterId: string, punishmentId: number): Promise<void> {
        const punishment = await this.prismaService.punishment.findUnique({
            where: { id: punishmentId },
            include: { blacklists: { include: { ipAddress: true } } }
        });
        if (!punishment) throw new NotFoundException(NotFound.DEFAULT);

        await this.assertHasPermission(requesterId, this.permissionForPunishmentType(punishment.type));

        await this.prismaService.punishment.delete({ where: { id: punishmentId } });

        for (const blacklist of punishment.blacklists) await this.redisService.deleteBlacklist(blacklist.ipAddress.ipAddress);
    }

    async ipBanUser(requesterId: string, id: string, dto: { reason: string; durationMinutes?: number }): Promise<StaffPunishmentEntity> {
        await this.assertHasPermission(requesterId, PermissionType.BLACKLIST_USERS);

        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true, ipAddressId: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);
        if (!user.ipAddressId) throw new NotFoundException(NotFound.DEFAULT);

        const expiresAt = dto.durationMinutes
            ? new Date(Date.now() + dto.durationMinutes * 60 * 1000)
            : new Date(Date.now() + PERMANENT_DURATION_MS);

        const punishment = await this.prismaService.punishment.create({
            data: {
                userId: id,
                staffId: requesterId,
                type: PunishmentType.BLACKLIST,
                reason: dto.reason,
                expiresAt
            }
        });

        const blacklist = await this.prismaService.blacklist.create({
            data: {
                ipAddressId: user.ipAddressId,
                punishmentId: punishment.id
            },
            include: { ipAddress: true, punishment: true }
        });

        await this.redisService.setBlacklist(blacklist.ipAddress.ipAddress, blacklist);

        return new StaffPunishmentEntity(punishment);
    }

    async deleteUser(requesterId: string, id: string): Promise<void> {
        await this.assertIsOwnerOrDeveloper(requesterId);

        const user = await this.prismaService.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(NotFound.UNKNOWN_USER);

        await this.prismaService.user.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
