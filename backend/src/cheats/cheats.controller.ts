import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CheatsService } from "./cheats.service";
import { GetCurrentUser } from "src/core/decorator";
import { CheatsGiveDto, CheatsTriggerEventDto } from "@blacket/types";

@ApiTags("cheats")
@Controller("cheats")
export class CheatsController {
    constructor(private readonly cheatsService: CheatsService) {}

    @Get("users")
    async listUsers(@GetCurrentUser() requesterId: string, @Query("search") search?: string) {
        return await this.cheatsService.listUsers(requesterId, search);
    }

    @Post("give")
    async give(@GetCurrentUser() requesterId: string, @Body() dto: CheatsGiveDto) {
        return await this.cheatsService.give(requesterId, dto);
    }

    @Post("event")
    async triggerEvent(@GetCurrentUser() requesterId: string, @Body() dto: CheatsTriggerEventDto) {
        return this.cheatsService.triggerEvent(requesterId, dto);
    }
}
