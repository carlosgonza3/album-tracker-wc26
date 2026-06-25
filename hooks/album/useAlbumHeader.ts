// hooks/album/useAlbumHeader.ts

import { useContext } from 'react';

import {
    AlbumHeaderContext,
} from '@/context/AlbumHeaderProvider';

export function useAlbumHeader() {
    const context =
        useContext(
            AlbumHeaderContext
        );

    if (!context) {
        throw new Error(
            'useAlbumHeader must be used inside AlbumHeaderProvider'
        );
    }

    return context;
}