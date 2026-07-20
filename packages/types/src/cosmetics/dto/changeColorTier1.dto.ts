import { IsNotEmpty, Matches } from "class-validator";

// "rainbow" is a special sentinel value (animated gradient), restricted to
// Owner/Developer server-side in CosmeticsService - the DTO just needs to
// let it through validation alongside plain hex colors.
export class CosmeticsChangeColorTier1Dto {
    @IsNotEmpty()
    @Matches(/^(#[0-9a-fA-F]{6}|rainbow)$/)
    readonly color: string;
}

export default CosmeticsChangeColorTier1Dto;
