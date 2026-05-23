import type { RouteObject } from 'react-router-dom';
import { ChordProPage, SongsPage, SongEditorPage } from '../pages';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <SongsPage />,
  },
  {
    path: '/songs',
    element: <SongsPage />,
  },
  {
    path: '/songs/new',
    element: <SongEditorPage />,
  },
  {
    path: '/songs/:id/edit',
    element: <SongEditorPage />,
  },
  {
    path: '/chordpro',
    element: <ChordProPage />,
  },
];
