import { useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate, useSearchParams } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/use-cart';
import { savePendingPurchase } from '@/lib/pending-purchase';
import { ageLabel, hasSelectableSizeOption, productRequiresSizeSelection, productSizeLabels, selectionForOption, variantForSelection } from '@/lib/shopify/map';
import PriceTag from '@/components/PriceTag';
import NotifyMe from '@/components/NotifyMe';
import type { StoreMedia, StoreProduct, StoreCatalog } from '@/lib/shopify/types';

const COLOR_DOTS: Record<string, string> = {
  pink: '#e7a0b4',
  'mint green': '#9ec9ae',
  green: '#6a9a3a',
  yellow: '#e6c15a',
  navy: '#1e3a5f',
  beige: '#e6d3b3',
  white: '#f4f4f4',
  black: '#222222',
  red: '#c4473a',
  blue: '#3d6ea8',
};

function isColorOption(name: string): boolean {
  return /colou?r/i.test(name);
}

function ColorChoices({
  product,
  option,
  selected,
  onSelect,
}: {
  product: StoreProduct;
  option: StoreProduct['options'][number];
  selected: Record<string, string>;
  onSelect: (value: string) => void;
}) {
  const currentColor = selected[option.name] ?? option.values[0];
  return (
    <div className="mb-base">
      <p className="text-sm mb-xs" style={{ color: 'hsl(var(--foreground))' }}>
        Colour: <span className="font-semibold">{currentColor}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Colour">
        {option.values.map((value) => {
          const active = currentColor === value;
          const offered = product.variants.some((item) =>
            item.selectedOptions.some((entry) => entry.name === option.name && entry.value === value),
          );
          const available = product.variants.some(
            (item) =>
              item.available &&
              item.selectedOptions.some((entry) => entry.name === option.name && entry.value === value) &&
              item.selectedOptions.every((entry) => {
                if (entry.name === option.name) return true;
                const chosen = selected[entry.name];
                return !chosen || chosen === entry.value;
              }),
          );
          const photo = product.variants.find(
            (item) =>
              item.image &&
              item.selectedOptions.some((entry) => entry.name === option.name && entry.value === value),
          )?.image;
          const swatch = option.swatches?.find((item) => item.name === value);
          const fill = swatch?.swatchColor || COLOR_DOTS[value.trim().toLowerCase()];
          return (
            <button
              key={value}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={`Colour ${value}${available ? '' : ', sold out'}`}
              disabled={!offered}
              onClick={() => onSelect(value)}
              className="relative w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 disabled:opacity-40"
              style={{
                borderColor: active ? 'hsl(var(--foreground))' : 'hsl(var(--border))',
                padding: 2,
              }}
            >
              {photo || swatch?.swatchImage ? (
                <img src={photo || swatch?.swatchImage} alt="" className="w-full h-full object-cover rounded-md" />
              ) : (
                <span className="block w-full h-full rounded-md" style={{ background: fill || 'hsl(var(--muted))' }} />
              )}
              {!available ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-1 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top left, transparent calc(50% - 1px), hsl(var(--foreground) / 0.7) calc(50% - 1px), hsl(var(--foreground) / 0.7) calc(50% + 1px), transparent calc(50% + 1px))',
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryColors({
  colors,
  value,
  onSelect,
}: {
  colors: { name: string; hex?: string }[];
  value: string | null;
  onSelect: (name: string) => void;
}) {
  const current = value ?? colors[0]?.name ?? '';
  return (
    <div className="mb-base">
      <p className="text-sm mb-xs" style={{ color: 'hsl(var(--foreground))' }}>
        Colour: <span className="font-semibold">{current}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Colour">
        {colors.map((color) => {
          const active = current === color.name;
          return (
            <button
              key={color.name}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={`Colour ${color.name}`}
              onClick={() => onSelect(color.name)}
              className="w-16 h-16 rounded-lg border-2 shrink-0 p-0.5"
              style={{ borderColor: active ? 'hsl(var(--foreground))' : 'hsl(var(--border))' }}
            >
              <span
                className="block w-full h-full rounded-md border"
                style={{ background: color.hex || 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addVariant, attachBuyer } = useCart();
  const [mediaIndex, setMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const sizeLabels = useMemo(() => (product ? productSizeLabels(product) : []), [product]);
  const requiresSize = product ? productRequiresSizeSelection(product) : false;
  const sizeOptionName = useMemo(() => {
    if (!product) return 'Size';
    return (
      product.options.find((option) => /size|age/i.test(option.name) && !/^title$/i.test(option.name))?.name ??
      'Size'
    );
  }, [product]);
  const selectableSize = product ? hasSelectableSizeOption(product) : false;

  const preferredSizeFromUrl = useMemo(() => {
    const ageParam = params.get('age');
    if (!ageParam || sizeLabels.length === 0) return null;
    const labeled = ageLabel(ageParam);
    if (sizeLabels.includes(labeled)) return labeled;
    if (sizeLabels.includes(ageParam)) return ageParam;
    return null;
  }, [params, sizeLabels]);

  const initialSelection = useMemo(() => {
    const preferred =
      (preferredSizeFromUrl &&
        product?.variants.find((item) =>
          item.selectedOptions.some(
            (option) => /size|age/i.test(option.name) && option.value === preferredSizeFromUrl,
          ),
        )) ||
      product?.variants.find((item) => item.available) ||
      product?.variants[0];
    const selected: Record<string, string> = {};
    preferred?.selectedOptions.forEach((option) => {
      // Never auto-pick Size/Age — customer must choose (unless URL age already did).
      if (/size|age/i.test(option.name) && !/^title$/i.test(option.name)) {
        if (preferredSizeFromUrl && option.value === preferredSizeFromUrl) {
          selected[option.name] = option.value;
        }
        return;
      }
      selected[option.name] = option.value;
    });
    return selected;
  }, [product, preferredSizeFromUrl]);
  const [selected, setSelected] = useState<Record<string, string>>(initialSelection);
  const [chosenSize, setChosenSize] = useState<string | null>(preferredSizeFromUrl);
  const [chosenColor, setChosenColor] = useState<string | null>(product?.colors[0]?.name ?? null);

  useEffect(() => {
    setSelected(initialSelection);
    setChosenSize(preferredSizeFromUrl);
    setChosenColor(product?.colors[0]?.name ?? null);
    setMediaIndex(0);
    setQuantity(1);
    setMessage(null);
  }, [product?.id, product?.colors, initialSelection, preferredSizeFromUrl]);

  const variant = product ? variantForSelection(product, selected) : undefined;
  const gallery = useMemo(() => {
    if (!product) return [];
    if (!variant?.image) return product.media;
    const rest = product.media.filter((item) => item.url !== variant.image);
    return [{ kind: 'image' as const, url: variant.image, alt: product.name }, ...rest];
  }, [product, variant]);

  useEffect(() => {
    setMediaIndex(0);
  }, [variant?.id]);

  if (!product) {
    return (
      <main className="max-w-content mx-auto px-4 py-xxl text-center">
        <h1 className="text-3xl font-bold mb-sm" style={{ color: 'hsl(var(--foreground))' }}>Product not available</h1>
        <p className="mb-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {catalog.error || 'This product is not on the shop right now.'}
        </p>
        <Link to="/catalog" className="font-semibold" style={{ color: 'hsl(var(--brand-ink))' }}>Back to the shop</Link>
      </main>
    );
  }

  const media = gallery[mediaIndex] ?? gallery[0];
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const discountTitle = variant?.discountTitle ?? product.discountTitle;
  const currency = variant?.currency ?? product.currency;
  const soldOut = variant ? !variant.available : !product.available;
  const stockLabel = soldOut ? 'Sold out' : 'In stock';

  const onAdd = async () => {
    if (!variant || soldOut) return;
    if (requiresSize && !chosenSize) {
      setMessage('Please select a size');
      return;
    }
    setAdding(true);
    setMessage(null);
    const attributes = [
      ...(chosenSize ? [{ key: 'Size', value: chosenSize }] : []),
      ...(chosenColor ? [{ key: 'Color', value: chosenColor }] : []),
    ];
    const result = await addVariant(variant.id, quantity, attributes.length ? attributes : undefined);
    setAdding(false);
    setMessage(result.success ? 'Added to your bag' : result.error ?? 'Could not add this item');
  };

  const onBuyNow = async () => {
    if (!variant || soldOut) return;
    if (requiresSize && !chosenSize) {
      setMessage('Please select a size');
      return;
    }
    setBuying(true);
    setMessage(null);
    const attributes = [
      ...(chosenSize ? [{ key: 'Size', value: chosenSize }] : []),
      ...(chosenColor ? [{ key: 'Color', value: chosenColor }] : []),
    ];
    if (!user) {
      savePendingPurchase({
        kind: 'buy',
        variantId: variant.id,
        quantity,
        attributes: attributes.length ? attributes : undefined,
      });
      navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      setBuying(false);
      return;
    }
    const result = await addVariant(variant.id, quantity, attributes.length ? attributes : undefined);
    if (result.success && result.checkoutUrl) {
      const checkoutUrl = await attachBuyer(user);
      window.location.href = checkoutUrl || result.checkoutUrl;
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
          <Link to="/catalog" style={{ color: 'hsl(var(--brand-ink))' }}>Shop</Link>
          {product.category ? ` / ${product.category}` : ''}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
              {media ? <MediaFrame item={media} /> : <div className="w-full h-full" style={{ background: 'hsl(var(--muted))' }} />}
            </div>
            {gallery.length > 1 ? (
              <div className="flex gap-2 mt-sm overflow-x-auto">
                {gallery.map((item, index) => (
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
              <p className="text-xs font-bold uppercase tracking-wide mb-xs" style={{ color: 'hsl(var(--brand-ink))' }}>{product.badge}</p>
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

            {(() => {
              const sizeOption = product.options.find(
                (option) => /size|age/i.test(option.name) && !/^title$/i.test(option.name),
              );
              const otherOptions = product.options.filter(
                (option) =>
                  (option.values.length > 1 || option.name.toLowerCase() !== 'title') &&
                  !/size|age/i.test(option.name),
              );

              const hasColorOption = otherOptions.some((option) => isColorOption(option.name));

              return (
                <>
                  {otherOptions.filter((option) => isColorOption(option.name)).map((option) => (
                    <ColorChoices
                      key={option.name}
                      product={product}
                      option={option}
                      selected={selected}
                      onSelect={(value) => {
                        setMessage(null);
                        setSelected((current) => selectionForOption(product, current, option.name, value));
                      }}
                    />
                  ))}
                  {!hasColorOption && product.colors.length > 0 ? (
                    <CategoryColors
                      colors={product.colors}
                      value={chosenColor}
                      onSelect={(name) => {
                        setChosenColor(name);
                        setMessage(null);
                      }}
                    />
                  ) : null}
                  {sizeLabels.length > 0 ? (
                    <div className="mb-base">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sizeLabels.map((value) => {
                          const optionName = sizeOption?.name ?? sizeOptionName;
                          const active = chosenSize === value;
                          const offered = selectableSize
                            ? product.variants.some((item) =>
                                item.selectedOptions.some(
                                  (entry) => entry.name === optionName && entry.value === value,
                                ),
                              )
                            : true;
                          const available = selectableSize
                            ? product.variants.some(
                                (item) =>
                                  item.available &&
                                  item.selectedOptions.some(
                                    (entry) => entry.name === optionName && entry.value === value,
                                  ),
                              )
                            : true;
                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={selectableSize ? !offered || !available : false}
                              onClick={() => {
                                setChosenSize(value);
                                setMessage(null);
                                if (selectableSize && sizeOption) {
                                  setSelected((current) => selectionForOption(product, current, optionName, value));
                                }
                              }}
                              aria-pressed={active}
                              className="px-base py-xs rounded-full text-sm font-medium border inline-flex items-center gap-2 disabled:opacity-40"
                              style={{
                                background: active ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                                color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                                borderColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                cursor: selectableSize && (!offered || !available) ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                      {requiresSize && !chosenSize ? (
                        <p className="text-xs mt-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Select a size to add this to your bag
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {otherOptions.filter((option) => !isColorOption(option.name)).map((option) => (
                    <div key={option.name} className="mb-base">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const active = selected[option.name] === value;
                          const offered = product.variants.some((item) =>
                            item.selectedOptions.some((entry) => entry.name === option.name && entry.value === value),
                          );
                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={!offered}
                              onClick={() => setSelected((current) => selectionForOption(product, current, option.name, value))}
                              className="px-base py-xs rounded-full text-sm font-medium border inline-flex items-center gap-2 disabled:opacity-40"
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
                </>
              );
            })()}

            <div className="flex items-center gap-3 mb-base">
              <div className="flex items-center rounded-full overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
                <button type="button" className="w-10 h-10" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button type="button" className="w-10 h-10" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button
                type="button"
                onClick={onAdd}
                disabled={adding || buying || soldOut || (requiresSize && !chosenSize)}
                className="flex-1 flex items-center justify-center gap-2 px-xl py-sm rounded-full font-semibold disabled:opacity-60"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <ShoppingBag size={16} />
                {soldOut ? 'Sold out' : adding ? 'Adding' : 'Add to bag'}
              </button>
              <button
                type="button"
                onClick={onBuyNow}
                disabled={adding || buying || soldOut || (requiresSize && !chosenSize)}
                className="px-xl py-sm rounded-full font-semibold border disabled:opacity-60"
                style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--brand-ink))' }}
              >
                {buying ? 'Opening checkout' : 'Buy now'}
              </button>
            </div>
            {message ? <p className="text-sm mb-base" style={{ color: 'hsl(var(--muted-foreground))' }}>{message}</p> : null}
            <NotifyMe
              handle={product.handle}
              variantId={variant?.id ?? ''}
              selection={[chosenColor, chosenSize].filter(Boolean).join(', ')}
            />
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
          disabled={adding || soldOut || (requiresSize && !chosenSize)}
          className="flex-1 py-sm rounded-full font-semibold disabled:opacity-60"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          {soldOut ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
    </>
  );
}
