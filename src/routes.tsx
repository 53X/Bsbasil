import { Navigate, redirect, type RouteObject } from 'react-router';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import CatalogPage from './pages/catalog';
import ProductPage from './pages/product';
import CartPage from './pages/cart';
import { catalogLoader, homeLoader, productLoader } from './lib/shopify/storefront';
import ContactPage from './pages/contact';
import CheckoutSuccess from './pages/checkout/success';
import CheckoutCancel from './pages/checkout/cancel';
import PrivacyPolicyPage from './pages/privacy-policy';
import TermsOfUsePage from './pages/terms-of-use';
import FAQPage from './pages/faq';
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
    element: <AboutPage />,
  },
  {
    path: '/catalog',
    loader: catalogLoader,
    element: <CatalogPage />,
  },
  {
    path: '/products/:handle',
    loader: productLoader,
    element: <ProductPage />,
  },
  {
    path: '/shop',
    loader: () => redirect('/catalog'),
    element: <Navigate to="/catalog" replace />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/checkout/success',
    element: <CheckoutSuccess />,
  },
  {
    path: '/checkout/cancel',
    element: <CheckoutCancel />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terms-of-use',
    element: <TermsOfUsePage />,
  },
  {
    path: '/faq',
    element: <FAQPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export type Path = '/' | '/about' | '/catalog' | '/shop' | '/cart';
export type Params = Record<string, string | undefined>;
