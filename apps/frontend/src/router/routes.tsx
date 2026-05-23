import type { RouteObject } from 'react-router-dom';
import { ChordProPage } from '../pages';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ChordProPage />,
  },
];
