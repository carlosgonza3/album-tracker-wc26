import { useContext } from 'react';

import { StickerContext } from '@/context/StickerProvider';

export function useStickers() {
    const context = useContext(StickerContext);

    if (!context) {
        throw new Error(
            'useStickers must be used inside StickerProvider.'
        );
    }

    return context;
}