import type {
    AlbumCatalogue,
    StickerType,
} from '@/types/album';

export interface AlbumValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

const VALID_STICKER_TYPES = new Set<StickerType>([
    'sticker',
    'foil',
]);

function isNonEmptyString(
    value: unknown
): value is string {
    return (
        typeof value === 'string' &&
        value.trim().length > 0
    );
}

export function validateAlbumCatalogue(
    value: unknown
): AlbumValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value)
    ) {
        return {
            isValid: false,
            errors: ['The album catalogue must be an object.'],
            warnings,
        };
    }

    const catalogue = value as Partial<AlbumCatalogue>;

    if (!isNonEmptyString(catalogue.id)) {
        errors.push('Album id is missing or invalid.');
    }

    if (!isNonEmptyString(catalogue.name)) {
        errors.push('Album name is missing or invalid.');
    }

    if (!isNonEmptyString(catalogue.version)) {
        errors.push('Album version is missing or invalid.');
    }

    if (!Array.isArray(catalogue.sections)) {
        return {
            isValid: false,
            errors: [
                ...errors,
                'Album sections must be an array.',
            ],
            warnings,
        };
    }

    const sectionIds = new Set<string>();
    const stickerIds = new Set<string>();

    for (const [sectionIndex, section] of
        catalogue.sections.entries()) {
        const sectionLabel =
            isNonEmptyString(section.id)
                ? section.id
                : `index ${sectionIndex}`;

        if (!isNonEmptyString(section.id)) {
            errors.push(
                `Section at index ${sectionIndex} has an invalid id.`
            );
        } else if (sectionIds.has(section.id)) {
            errors.push(
                `Duplicate section id: "${section.id}".`
            );
        } else {
            sectionIds.add(section.id);
        }

        if (!isNonEmptyString(section.name)) {
            errors.push(
                `Section "${sectionLabel}" has an invalid name.`
            );
        }

        if (!Array.isArray(section.stickers)) {
            errors.push(
                `Section "${sectionLabel}" must contain a stickers array.`
            );

            continue;
        }

        if (section.stickers.length === 0) {
            warnings.push(
                `Section "${sectionLabel}" has no stickers.`
            );
        }

        for (const [stickerIndex, sticker] of
            section.stickers.entries()) {
            const stickerLabel =
                isNonEmptyString(sticker.id)
                    ? sticker.id
                    : `${sectionLabel}:${stickerIndex}`;

            if (!isNonEmptyString(sticker.id)) {
                errors.push(
                    `Sticker at index ${stickerIndex} in section "${sectionLabel}" has an invalid id.`
                );
            } else if (stickerIds.has(sticker.id)) {
                errors.push(
                    `Duplicate sticker id: "${sticker.id}".`
                );
            } else {
                stickerIds.add(sticker.id);
            }

            if (!isNonEmptyString(sticker.name)) {
                warnings.push(
                    `Sticker "${stickerLabel}" has an invalid name.`
                );
            }

            if (
                typeof sticker.type !== 'string' ||
                !VALID_STICKER_TYPES.has(
                    sticker.type as StickerType
                )
            ) {
                errors.push(
                    `Sticker "${stickerLabel}" has an invalid type: "${String(
                        sticker.type
                    )}".`
                );
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}