import { IsNotEmpty, IsUrl, MaxLength } from "class-validator";

export class CosmeticsChangeAvatarUrlDto {
    @IsNotEmpty()
    @IsUrl({ protocols: ["http", "https"], require_protocol: true })
    @MaxLength(1024)
    readonly url: string;
}

export default CosmeticsChangeAvatarUrlDto;
