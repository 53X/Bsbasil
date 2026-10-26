import { Navigate, redirect, type RouteObject } from 'react-router';
import HomePage from './pages/index';
import { aboutLoader, catalogLoader, contactLoader, homeLoader, productLoader } from './lib/shopify/storefront';
// Eager import so renderToString doesn't hit a Suspense boundary on 404 routes
// and abort to client rendering. The prod 404 page is tiny; the dev-tools
// variant stays lazy because it pulls in dev-only code we don't want in
// production bundles.
import ProdNotFoundPage from './pages/_404';

const NotFoundPage = ProdNotFoundPage;

export const routes: RouteObject[] = [
  {
    path: '/',
    loader: homeLoader,
    element: <HomePage />,
  },
  {
    path: '/about',
    loader: aboutLoader,
    lazy: () => import('./pages/about').then((m) => ({ Component: m.default })),
  },
  {
    path: '/catalog',
    loader: catalogLoader,
    // Age, category, search, and sort only narrow the products already loaded.
    // Refetching Shopify on each click is what made the filters feel stuck.
    shouldRevalidate({ currentUrl, nextUrl }) {
      return currentUrl.pathname !== nextUrl.pathname;
    },
    lazy: () => import('./pages/catalog').then((m) => ({ Component: m.default })),
  },
  {
    path: '/lookbook',
    lazy: () => import('./pages/lookbook').then((m) => ({ Component: m.default })),
  },
  {
    path: '/products/:handle',
    loader: productLoader,
    lazy: () => import('./pages/product').then((m) => ({ Component: m.default })),
  },
  {
    path: '/shop',
    loader: () => redirect('/catalog'),
    element: <Navigate to="/catalog" replace />,
  },
  {
    path: '/cart',
    lazy: () => import('./pages/cart').then((m) => ({ Component: m.default })),
  },
  {
    path: '/contact',
    loader: contactLoader,
    lazy: () => import('./pages/contact').then((m) => ({ Component: m.default })),
  },
  {
    path: '/sign-in',
    lazy: () => import('./pages/sign-in').then((m) => ({ Component: m.default })),
  },
  {
    path: '/sign-up',
    lazy: () => import('./pages/sign-in').then((m) => ({ Component: m.default })),
  },
  {
    path: '/checkout/success',
    lazy: () => import('./pages/checkout/success').then((m) => ({ Component: m.default })),
  },
  {
    path: '/checkout/cancel',
    lazy: () => import('./pages/checkout/cancel').then((m) => ({ Component: m.default })),
  },
  {
    path: '/privacy-policy',
    lazy: () => import('./pages/privacy-policy').then((m) => ({ Component: m.default })),
  },
  {
    path: '/terms-of-use',
    lazy: () => import('./pages/terms-of-use').then((m) => ({ Component: m.default })),
  },
  {
    path: '/faq',
    lazy: () => import('./pages/faq').then((m) => ({ Component: m.default })),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export type Path = '/' | '/about' | '/catalog' | '/lookbook' | '/shop' | '/cart';
export type Params = Record<string, string | undefined>;
