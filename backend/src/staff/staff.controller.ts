import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { StaffService } from "./staff.service";
import { GetCurrentUser, Permissions } from "src/core/decorator";
import {
    PermissionTypeEnum,
    StaffAdminEditUserCurrencyDto,
    StaffAdminEditUserGroupsDto,
    StaffAdminGiveTokensDto,
    StaffAdminGiveUserBlookDto,
    StaffAdminIpBanUserDto,
    StaffAdminPunishUserDto,
    StaffAdminSetUserAvatarDto
} from "@blacket/types";

@ApiTags("staff")
@Controller("staff")
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Permissions({ permissions: [PermissionTypeEnum.MUTE_USERS] })
    @Get("moderation/users")
    async searchUsersForModeration(@Query("search") search?: string) {
        return await this.staffService.searchUsersForModeration(search);
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_DATA] })
    @Get("users")
    async searchUsers(@Query("search") search?: string) {
        return await this.staffService.searchUsers(search);
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_DATA] })
    @Get("users/:id")
    async getUser(@Param("id") id: string) {
        return await this.staffService.getUser(id);
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_DATA] })
    @Patch("users/:id/currency")
    async editCurrency(@GetCurrentUser() requesterId: string, @Param("id") id: string, @Body() dto: StaffAdminEditUserCurrencyDto) {
        return await this.staffService.editCurrency(requesterId, id, dto);
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_USER_BLOOKS] })
    @Post("users/:id/blooks")
    async giveBlook(@GetCurrentUser() requesterId: string, @Param("id") id: string, @Body() dto: StaffAdminGiveUserBlookDto) {
        return await this.staffService.giveBlook(requesterId, id, dto);
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_DATA] })
    @Patch("users/:id/avatar")
    async setAvatar(@GetCurrentUser() requesterId: string, @Param("id") id: string, @Body() dto: StaffAdminSetUserAvatarDto) {
        return await this.staffService.setAvatar(requesterId, id, dto);
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_DATA] })
    @Get("groups")
    async listGroups() {
        return await this.staffService.listGroups();
    }

    @Permissions({ permissions: [PermissionTypeEnum.MANAGE_USER_GROUPS] })
    @Put("users/:id/groups")
    async editGroups(@GetCurrentUser() requesterId: string, @Param("id") id: string, @Body() dto: StaffAdminEditUserGroupsDto) {
        return await this.staffService.editGroups(requesterId, id, dto);
    }

    @Post("give")
    async giveTokens(@GetCurrentUser() requesterId: string, @Body() dto: StaffAdminGiveTokensDto) {
        return await this.staffService.giveTokens(requesterId, dto);
    }

    @Post("users/:id/punishments")
    async punishUser(@GetCurrentUser() requesterId: string, @Param("id") id: string, @Body() dto: StaffAdminPunishUserDto) {
        return await this.staffService.punishUser(requesterId, id, dto);
    }

    @Get("users/:id/punishments")
    async listPunishments(@GetCurrentUser() requesterId: string, @Param("id") id: string) {
        return await this.staffService.listPunishments(requesterId, id);
    }

    @Delete("punishments/:punishmentId")
    async revokePunishment(@GetCurrentUser() requesterId: string, @Param("punishmentId") punishmentId: string) {
        return await this.staffService.revokePunishment(requesterId, Number(punishmentId));
    }

    @Post("users/:id/ip-ban")
    async ipBanUser(@GetCurrentUser() requesterId: string, @Param("id") id: string, @Body() dto: StaffAdminIpBanUserDto) {
        return await this.staffService.ipBanUser(requesterId, id, dto);
    }

    @Delete("users/:id")
    async deleteUser(@GetCurrentUser() requesterId: string, @Param("id") id: string) {
        return await this.staffService.deleteUser(requesterId, id);
    }
}
