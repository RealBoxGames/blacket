import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class StaffAdminIpBanUserDto {
    @IsNotEmpty()
    @IsString()
    readonly reason: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    readonly durationMinutes?: number;
}

export default StaffAdminIpBanUserDto;
