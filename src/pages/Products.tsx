import { Navigate } from 'react-router';

/** The old Stripe shop now lives on the catalog, which reads from Shopify. */
export default function ProductsPage() {
  return <Navigate to="/catalog" replace />;
}
