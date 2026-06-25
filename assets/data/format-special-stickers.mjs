import { readFile, writeFile } from 'node:fs/promises';

const INPUT_FILE = './album.json';
const OUTPUT_FILE = './album-formatted.json';

const worldCupStickerNames = {
    FWC1: 'FIFA World Cup 2026 Official Emblem',
    FWC2: 'FIFA World Cup Trophy',
    FWC3: 'FIFA World Cup 2026 Branding',
    FWC4: 'FIFA World Cup 2026 Host Cities',
    FWC5: 'FIFA World Cup 2026 Tournament Identity',
    FWC6: 'FIFA World Cup 2026 Special Feature',
    FWC7: 'FIFA World Cup 2026 Special Feature',
    FWC8: 'FIFA World Cup 2026 Special Feature',

    FWC9: 'FIFA World Cup History 01',
    FWC10: 'FIFA World Cup History 02',
    FWC11: 'FIFA World Cup History 03',
    FWC12: 'FIFA World Cup History 04',
    FWC13: 'FIFA World Cup History 05',
    FWC14: 'FIFA World Cup History 06',
    FWC15: 'FIFA World Cup History 07',
    FWC16: 'FIFA World Cup History 08',
    FWC17: 'FIFA World Cup History 09',
    FWC18: 'FIFA World Cup History 10',
    FWC19: 'FIFA World Cup History 11',
};

function getSpecialStickerName(section, sticker) {
    if (sticker.id === '00') {
        return 'Panini Logo';
    }

    const worldCupName =
        worldCupStickerNames[sticker.id];

    if (worldCupName) {
        return worldCupName;
    }

    if (
        sticker.type === 'foil' &&
        sticker.id === `${section.id}1`
    ) {
        return `${section.name} Team Emblem`;
    }

    return sticker.name;
}

async function formatAlbum() {
    const fileContent =
        await readFile(INPUT_FILE, 'utf8');

    const album = JSON.parse(fileContent);

    album.sections = album.sections.map(
        (section) => ({
            ...section,

            stickers: section.stickers.map(
                (sticker) => {
                    const correctedSticker =
                        sticker.id === 'PAN13'
                            ? {
                                ...sticker,
                                name: 'PAN 13',
                            }
                            : sticker;

                    return {
                        ...correctedSticker,

                        name:
                            getSpecialStickerName(
                                section,
                                correctedSticker
                            ),
                    };
                }
            ),
        })
    );

    await writeFile(
        OUTPUT_FILE,
        `${JSON.stringify(album, null, 2)}\n`,
        'utf8'
    );

    console.log(
        `Formatted album written to ${OUTPUT_FILE}`
    );
}

formatAlbum().catch((error) => {
    console.error(
        'Unable to format album JSON:',
        error
    );

    process.exitCode = 1;
});