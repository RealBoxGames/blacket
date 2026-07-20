import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class NewsCreateDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly content: string;

    @IsOptional()
    @IsInt()
    readonly imageId?: number;
}

export default NewsCreateDto;
