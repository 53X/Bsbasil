import { useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ShoppingBag } from 'lucide-react';
import ShareButtons from '@/components/ShareButtons';
import { useCart } from '@/contexts/use-cart';
import { matchingVariant } from '@/lib/shopify/map';
import PriceTag from '@/components/PriceTag';
import type { StoreMedia, StoreProduct, StoreCatalog } from '@/lib/shopify/types';

const SIZE_GUIDE = [
  ['Newborn', 'Up to 3.5 kg'],
  ['0–3 months', '3.5–6 kg'],
  ['3–6 months', '6–8 kg'],
  ['6–12 months', '8–10 kg'],
  ['1–2 years', '10–12 kg'],
  ['2–3 years', '12–14 kg'],
];

function MediaFrame({ item }: { item: StoreMedia }) {
  if (item.kind === 'video' && item.url) {
    return (
      <video
        key={item.url}
        src={item.url}
        poster={item.poster}
        controls
        playsInline
        className="w-full h-full object-cover bg-black"
      />
    );
  }
  if (item.kind === 'external' && item.embedUrl) {
    return (
      <iframe
        key={item.embedUrl}
        src={item.embedUrl}
        title={item.alt}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <img
      src={item.url || item.poster}
      alt={item.alt}
      className="w-full h-full object-cover"
      width={800}
      height={800}
    />
  );
}

export default function ProductPage() {
  const { product, catalog } = useLoaderData() as { product: StoreProduct | null; catalog: StoreCatalog };
  const { addVariant } = useCart();
  const [mediaIndex, setMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const initialSelection = useMemo(() => {
    const variant = product?.variants.find((item) => item.available) ?? product?.variants[0];
    const selected: Record<string, string> = {};
    variant?.selectedOptions.forEach((option) => {
      selected[option.name] = option.value;
    });
    return selected;
  }, [product]);
  const [selected, setSelected] = useState<Record<string, string>>(initialSelection);

  useEffect(() => {
    setSelected(initialSelection);
    setMediaIndex(0);
    setQuantity(1);
    setMessage(null);
    // Reset only when the product itself changes. initialSelection is derived from that product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) {
    return (
      <main className="max-w-content mx-auto px-4 py-xxl text-center">
        <h1 className="text-3xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>Product not available</h1>
        <p className="mb-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {catalog.error || 'This product is not on the shop right now.'}
        </p>
        <Link to="/catalog" className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>Back to the shop</Link>
      </main>
    );
  }

  const variant = matchingVariant(product, selected) ?? product.variants[0];
  const media = product.media[mediaIndex] ?? product.media[0];
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const discountTitle = variant?.discountTitle ?? product.discountTitle;
  const currency = variant?.currency ?? product.currency;
  const soldOut = variant ? !variant.available : !product.available;
  const stockLabel = soldOut
    ? 'Sold out'
    : variant?.quantityAvailable != null
      ? `${variant.quantityAvailable} in stock`
      : 'In stock';

  const onAdd = async () => {
    if (!variant || soldOut) return;
    setAdding(true);
    setMessage(null);
    const result = await addVariant(variant.id, quantity);
    setAdding(false);
    setMessage(result.success ? 'Added to your bag' : result.error ?? 'Could not add this item');
  };

  const onBuyNow = async () => {
    if (!variant || soldOut) return;
    setBuying(true);
    setMessage(null);
    const result = await addVariant(variant.id, quantity);
    if (result.success && result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }
    setBuying(false);
    setMessage(result.error ?? 'Checkout is not ready yet.');
  };

  return (
    <>
      <Helmet>
        <title>{`${product.name} — Bsbasil`}</title>
        <meta name="description" content={product.description.slice(0, 160) || `${product.name} from Bsbasil.`} />
        <link rel="canonical" href={`https://bsbasil.com/products/${product.handle}`} />
      </Helmet>
      <main className="max-w-content mx-auto px-4 py-xl pb-28 md:pb-xl">
        <p className="text-sm mb-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <Link to="/catalog" style={{ color: 'hsl(var(--primary))' }}>Shop</Link>
          {product.category ? ` / ${product.category}` : ''}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
              {media ? <MediaFrame item={media} /> : <div className="w-full h-full" style={{ background: 'hsl(var(--muted))' }} />}
            </div>
            {product.media.length > 1 ? (
              <div className="flex gap-2 mt-sm overflow-x-auto">
                {product.media.map((item, index) => (
                  <button
                    key={`${item.kind}-${item.url ?? item.embedUrl}-${index}`}
                    type="button"
                    onClick={() => setMediaIndex(index)}
                    className="w-16 h-16 rounded-xl overflow-hidden border shrink-0"
                    style={{ borderColor: index === mediaIndex ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                    aria-label={item.kind === 'image' ? 'Show photo' : 'Play video'}
                  >
                    <img src={item.kind === 'image' ? item.url : item.poster || item.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {product.badge ? (
              <p className="text-xs font-bold uppercase tracking-wide mb-xs" style={{ color: 'hsl(var(--primary))' }}>{product.badge}</p>
            ) : null}
            <h1 className="text-3xl md:text-4xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>{product.name}</h1>
            <p className="mb-xs">
              <PriceTag price={price} compareAt={compareAt} currency={currency} discount={discountTitle} priceClassName="text-2xl font-bold" />
            </p>
            <p className="text-sm mb-base" style={{ color: soldOut ? 'hsl(var(--destructive, 0 70% 45%))' : 'hsl(var(--muted-foreground))' }}>{stockLabel}</p>
            {product.description ? (
              <p className="text-base mb-lg whitespace-pre-line" style={{ color: 'hsl(var(--muted-foreground))' }}>{product.description}</p>
            ) : null}

            {(() => {
              const facts = [
                ['Delivery fee', catalog.rules.deliveryFee],
                ['Returns', catalog.rules.returnPolicy],
                ['GST', catalog.rules.pricesIncludeGst],
                ['Cash on delivery', catalog.rules.cashOnDelivery],
              ].filter((row): row is [string, string] => Boolean(row[1]));
              if (!facts.length) return null;
              return (
                <dl className="mb-lg rounded-2xl border divide-y" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  {facts.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 px-base py-sm">
                      <dt className="text-sm font-semibold">{label}</dt>
                      <dd className="text-sm text-right" style={{ color: 'hsl(var(--muted-foreground))' }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              );
            })()}

            {product.options.filter((option) => option.values.length > 1 || option.name.toLowerCase() !== 'title').map((option) => (
              <div key={option.name} className="mb-base">
                <p className="text-xs font-semibold uppercase tracking-wide mb-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const active = selected[option.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}
                        className="px-base py-xs rounded-full text-sm font-medium border"
                        style={{
                          background: active ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                          color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                          borderColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                        }}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3 mb-base">
              <div className="flex items-center rounded-full overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
                <button type="button" className="w-10 h-10" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button type="button" className="w-10 h-10" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button
                type="button"
                onClick={onAdd}
                disabled={adding || buying || soldOut}
                className="flex-1 flex items-center justify-center gap-2 px-xl py-sm rounded-full font-semibold disabled:opacity-60"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <ShoppingBag size={16} />
                {soldOut ? 'Sold out' : adding ? 'Adding' : 'Add to bag'}
              </button>
              <button
                type="button"
                onClick={onBuyNow}
                disabled={adding || buying || soldOut}
                className="px-xl py-sm rounded-full font-semibold border disabled:opacity-60"
                style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}
              >
                {buying ? 'Opening checkout' : 'Buy now'}
              </button>
            </div>
            {message ? <p className="text-sm mb-base" style={{ color: 'hsl(var(--muted-foreground))' }}>{message}</p> : null}
            <ShareButtons productName={product.name} productPrice={product.priceLabel} url={`https://bsbasil.com/products/${product.handle}`} />
          </div>
        </div>

        <section className="mt-xxl grid grid-cols-1 md:grid-cols-2 gap-base">
          <article className="rounded-2xl border p-lg" style={{ borderColor: 'hsl(var(--border))' }}>
            <h2 className="text-lg font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>Size guide</h2>
            <ul className="text-sm space-y-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {SIZE_GUIDE.map(([label, weight]) => (
                <li key={label} className="flex justify-between gap-4"><span>{label}</span><span>{weight}</span></li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border p-lg" style={{ borderColor: 'hsl(var(--border))' }}>
            <h2 className="text-lg font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
              {catalog.policies.shipping?.title || 'Shipping'}
            </h2>
            <p className="text-sm whitespace-pre-line" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {catalog.policies.shipping?.body || 'Shipping details will appear here once they are saved in Shopify.'}
            </p>
          </article>
          <article className="rounded-2xl border p-lg md:col-span-2" style={{ borderColor: 'hsl(var(--border))' }}>
            <h2 className="text-lg font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>
              {catalog.policies.refund?.title || 'Returns and refunds'}
            </h2>
            <p className="text-sm whitespace-pre-line" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {catalog.policies.refund?.body || 'The return and refund policy will appear here once it is saved in Shopify.'}
            </p>
          </article>
        </section>
      </main>
      <div
        className="fixed bottom-0 inset-x-0 z-40 border-t p-3 md:hidden flex items-center gap-3"
        style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
      >
        <PriceTag price={price} compareAt={compareAt} currency={currency} discount={discountTitle} />
        <button
          type="button"
          onClick={onAdd}
          disabled={adding || soldOut}
          className="flex-1 py-sm rounded-full font-semibold disabled:opacity-60"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          {soldOut ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
    </>
  );
}
