import { IsIn, IsInt, IsNotEmpty, IsNumber, Min } from "class-validator";

export class StaffAdminCreateBoosterDto {
    @IsNotEmpty()
    @IsIn(["CHANCE", "EXPERIENCE", "SHINY"])
    readonly type: "CHANCE" | "EXPERIENCE" | "SHINY";

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    readonly multiplier: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    readonly durationMinutes: number;
}

export default StaffAdminCreateBoosterDto;
