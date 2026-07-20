import { Module } from "@nestjs/common";
import { CheatsService } from "./cheats.service";
import { CheatsController } from "./cheats.controller";

@Module({
    providers: [CheatsService],
    controllers: [CheatsController]
})
export class CheatsModule {}
