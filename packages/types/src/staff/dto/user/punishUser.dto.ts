import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class StaffAdminPunishUserDto {
    @IsNotEmpty()
    @IsIn(["BAN", "MUTE"])
    readonly type: "BAN" | "MUTE";

    @IsNotEmpty()
    @IsString()
    readonly reason: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    readonly durationMinutes?: number;
}

export default StaffAdminPunishUserDto;
