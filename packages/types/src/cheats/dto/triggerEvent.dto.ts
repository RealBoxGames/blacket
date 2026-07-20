import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CheatsTriggerEventDto {
    @IsOptional()
    @IsIn(["rgb", "snow", "none"])
    readonly visual?: "rgb" | "snow" | "none";

    @IsOptional()
    @IsString()
    @MaxLength(200)
    readonly text?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(120)
    readonly durationSeconds?: number;
}

export default CheatsTriggerEventDto;
