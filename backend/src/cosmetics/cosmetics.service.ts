import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CoreService } from "src/core/core.service";
import { S3Service } from "src/s3/s3.service";
import { OwnerTierService } from "src/core/ownerTier.service";
import {
    CosmeticsChangeBannerDto,
    CosmeticsChangeColorTier1Dto,
    CosmeticsChangeColorTier2Dto,
    CosmeticsChangeFontDto,
    CosmeticsChangeTitleDto,
    NotFound,
    Forbidden,
    CosmeticsChangeAvatarDto,
    CosmeticsChangeAvatarUrlDto,
    CosmeticsChangeBannerUrlDto,
    CosmeticsUploadAvatarDto,
    CosmeticsUploadBannerDto,
    InternalServerError
} from "@blacket/types";
import axios from "axios";

@Injectable()
export class CosmeticsService {
    constructor(private redisService: RedisService,
        private prismaService: PrismaService,
        private coreService: CoreService,
        private s3Service: S3Service,
        private ownerTierService: OwnerTierService,) {}

    async changeAvatar(userId: string, dto: CosmeticsChangeAvatarDto) {
        if (dto.id === 0) {
            await this.prismaService.user.update({
                data: {
                    avatar: { disconnect: true },
                    customAvatar: { disconnect: true },
                    customAvatarUrl: null
                },
                where: { id: userId }
            });
        } else {
            const blook = await this.prismaService.userBlook.findFirst({
                where: {
                    id: dto.id,
                    userId
                }
            });
            if (!blook) throw new NotFoundException(NotFound.UNKNOWN_BLOOK);

            await this.prismaService.user.update({
                data: {
                    avatar: { connect: { id: blook.id } },
                    customAvatar: { disconnect: true },
                    customAvatarUrl: null
                },
                where: { id: userId }
            });
        }
    }

    async changeBanner(userId: string, dto: CosmeticsChangeBannerDto) {
        const banner = await this.redisService.getBanner(dto.bannerId);
        if (!banner) throw new NotFoundException(NotFound.UNKNOWN_BANNER);

        const userBannerCount = await this.prismaService.userBanner.count({
            where: { userId, bannerId: dto.bannerId }
        });

        if (!banner.default && userBannerCount < 1) throw new ForbiddenException(Forbidden.COSMETICS_BANNERS_NOT_OWNED);

        await this.prismaService.user.update({
            data: {
                banner: { connect: { id: banner.imageId } },
                customBanner: { disconnect: true },
                customBannerUrl: null
            },
            where: { id: userId }
        });
    }

    // lets a qualifying user set their avatar/banner to any image URL (e.g.
    // hosted on a free image host like imgur) instead of going through the
    // S3 upload pipeline
    async changeAvatarUrl(userId: string, dto: CosmeticsChangeAvatarUrlDto) {
        await this.prismaService.user.update({
            data: {
                avatar: { disconnect: true },
                customAvatar: { disconnect: true },
                customAvatarUrl: dto.url
            },
            where: { id: userId }
        });
    }

    async changeBannerUrl(userId: string, dto: CosmeticsChangeBannerUrlDto) {
        await this.prismaService.user.update({
            data: {
                banner: { disconnect: true },
                customBanner: { disconnect: true },
                customBannerUrl: dto.url
            },
            where: { id: userId }
        });
    }

    async changeTitle(userId: string, dto: CosmeticsChangeTitleDto) {
        const title = await this.redisService.getTitle(dto.titleId);
        if (!title) throw new NotFoundException(NotFound.UNKNOWN_TITLE);

        const userTitleCount = await this.prismaService.userTitle.count({
            where: { userId, titleId: dto.titleId }
        });
        if (!title.default && userTitleCount < 1) throw new ForbiddenException(Forbidden.COSMETICS_TITLES_NOT_OWNED);

        await this.prismaService.user.update({
            data: { title: { connect: { id: title.id } } },
            where: { id: userId }
        });
    }

    async changeColorTier1(userId: string, dto: CosmeticsChangeColorTier1Dto) {
        if (dto.color === "rainbow") await this.ownerTierService.assert(userId);

        await this.prismaService.user.update({
            data: { color: dto.color },
            where: { id: userId }
        });
    }

    async changeColorTier2(userId: string, dto: CosmeticsChangeColorTier2Dto) {
        await this.prismaService.user.update({
            data: { color: dto.color },
            where: { id: userId }
        });
    }

    async changeFont(userId: string, dto: CosmeticsChangeFontDto) {
        const font = await this.redisService.getFont(dto.fontId);
        if (!font) throw new NotFoundException(NotFound.UNKNOWN_FONT);

        const userFontCount = await this.prismaService.userFont.count({
            where: { userId, fontId: dto.fontId }
        });
        if (!font.default && userFontCount < 1) throw new ForbiddenException(Forbidden.COSMETICS_FONTS_NOT_OWNED);

        await this.prismaService.user.update({
            data: { font: { connect: { id: font.id } } },
            where: { id: userId }
        });
    }

    async uploadAvatar(userId: string, dto: CosmeticsUploadAvatarDto) {
        const upload = await this.prismaService.upload.findUnique({
            where: {
                id: dto.uploadId,
                userId
            }
        });
        if (!upload) throw new NotFoundException(NotFound.UNKNOWN_UPLOAD);

        const image = await axios
            .get(await this.coreService.getUserUploadPath(upload), {
                responseType: "arraybuffer"
            })
            .then((res) => res.data)
            .catch(() => {
                throw new NotFoundException(NotFound.UNKNOWN_UPLOAD);
            });
        const blookifiedImage = await this.coreService.blookifyImage(image);

        const presignedUrl = await this.s3Service.createPresignedPost(userId, "avatar.webp", "image/webp", 1024 * 1024 * 2,);

        const formData = new FormData();
        Object.entries(presignedUrl.fields).forEach(([k, v]) =>
            formData.append(k, v as string),);

        formData.append("file", new Blob([new Uint8Array(blookifiedImage)], { type: "image/webp" }), "avatar.webp",);

        const s3Upload = await fetch(presignedUrl.url, {
            method: "POST",
            body: formData
        });
        if (!s3Upload.ok) throw new InternalServerErrorException(InternalServerError.DEFAULT);

        const newUpload = await this.s3Service.verifyUpload(userId, {
            uploadId: presignedUrl.fields.key.split("/")[2]
        });
        if (!newUpload) throw new InternalServerErrorException(InternalServerError.DEFAULT);

        await this.prismaService.user.update({
            data: {
                avatar: { disconnect: true },
                customAvatar: { connect: { id: newUpload.id } },
                customAvatarUrl: null
            },
            where: { id: userId }
        });

        return newUpload;
    }

    async uploadBanner(userId: string, dto: CosmeticsUploadBannerDto) {
        const upload = await this.prismaService.upload.findUnique({
            where: {
                id: dto.uploadId,
                userId
            }
        });
        if (!upload) throw new NotFoundException(NotFound.UNKNOWN_UPLOAD);

        const image = await axios
            .get(await this.coreService.getUserUploadPath(upload), {
                responseType: "arraybuffer"
            })
            .then((res) => res.data)
            .catch(() => {
                throw new NotFoundException(NotFound.UNKNOWN_UPLOAD);
            });
        const bannerifiedImage = await this.coreService.bannerifyImage(image);

        const presignedUrl = await this.s3Service.createPresignedPost(userId, "banner.webp", "image/webp", 1024 * 1024 * 2,);

        const formData = new FormData();
        Object.entries(presignedUrl.fields).forEach(([k, v]) =>
            formData.append(k, v as string),);
        formData.append("file", new Blob([new Uint8Array(bannerifiedImage)], {
                type: "image/webp"
            }), "banner.webp",);

        const s3Upload = await fetch(presignedUrl.url, {
            method: "POST",
            body: formData
        });
        if (!s3Upload.ok) throw new InternalServerErrorException(InternalServerError.DEFAULT);

        const newUpload = await this.s3Service.verifyUpload(userId, {
            uploadId: presignedUrl.fields.key.split("/")[2]
        });
        if (!newUpload) throw new InternalServerErrorException(InternalServerError.DEFAULT);

        await this.prismaService.user.update({
            data: {
                customBanner: { connect: { id: newUpload.id } },
                customBannerUrl: null
            },
            where: { id: userId }
        });

        return newUpload;
    }
}
