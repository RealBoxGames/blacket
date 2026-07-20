import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CheatsGiveDto {
    @IsNotEmpty()
    @IsString()
    readonly targetUserId: string;

    @IsOptional()
    @IsInt()
    readonly tokens?: number;

    @IsOptional()
    @IsInt()
    readonly diamonds?: number;

    @IsOptional()
    @IsInt()
    readonly crystals?: number;

    @IsOptional()
    @IsInt()
    readonly experience?: number;

    @IsOptional()
    @IsInt()
    readonly blookId?: number;

    @IsOptional()
    @IsBoolean()
    readonly shiny?: boolean;

    @IsOptional()
    @IsInt()
    readonly groupId?: number;
}

export default CheatsGiveDto;
