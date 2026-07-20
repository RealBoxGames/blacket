import { Global, Module } from "@nestjs/common";
import { CoreService } from "./core.service";
import { OwnerTierService } from "./ownerTier.service";

@Global()
@Module({
    providers: [CoreService, OwnerTierService],
    exports: [CoreService, OwnerTierService]
})
export class CoreModule {}
