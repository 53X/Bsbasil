import { useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { contact } from 'virtual:content';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const formData = new FormData(form);
    if (formData.get('_gotcha')) return;

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    setStatus('sending');
    setErrorMsg('');

    try {
      // Field mapping: only the message textarea goes in messages_attributes[0].body.
      // All other fields (dropdowns, radios, checkboxes) must be added to conversation.data as { "Label": value } pairs.
      const res = await fetch('/api/contact/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: {
            messages_attributes: [{ body: message || 'New contact form submission' }],
            data: {
              __gd_contact_form_title: 'Contact Bsbasil',
              'Phone': phone || 'Not provided',
              'Subject': subject || 'General Enquiry',
            },
          },
          user: { email, name },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatus('success');
        form.reset();
      } else {
        throw new Error(json.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Bsbasil — Baby Clothes Enquiries & Orders | India</title>
        <meta
          name="description"
          content="Contact Bsbasil for baby clothing enquiries, order support, sizing help, or bulk orders. Reach us via WhatsApp, email, or our contact form. Pan-India delivery."
        />
        <link rel="canonical" href="https://bsbasil.com/contact" />
        <meta property="og:title" content="Contact Bsbasil — Baby Clothes Enquiries & Orders" />
        <meta property="og:description" content="Reach Bsbasil for baby clothing enquiries, order support, sizing help, or bulk orders. WhatsApp, email, or contact form." />
        <meta property="og:url" content="https://bsbasil.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bsbasil.com/og-image.png" />
        <meta property="og:image:alt" content="Contact Bsbasil — baby clothes for ages 0–3" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Bsbasil — Baby Clothes Enquiries & Orders" />
        <meta name="twitter:description" content="Reach Bsbasil for baby clothing enquiries, order support, sizing help, or bulk orders." />
        <meta name="twitter:image" content="https://bsbasil.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          '@id': 'https://bsbasil.com/contact#webpage',
          name: 'Contact Bsbasil — Baby Clothes Enquiries & Orders',
          url: 'https://bsbasil.com/contact',
          description: 'Contact Bsbasil for baby clothing enquiries, order support, sizing help, or bulk orders.',
          isPartOf: { '@id': 'https://bsbasil.com/#website' },
          about: { '@id': 'https://bsbasil.com/#organization' },
          inLanguage: 'en-IN',
        }).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <main>
        {/* Hero */}
        <section className="py-xxl text-center" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-content mx-auto px-4">
            <p
              className="text-sm font-semibold mb-sm tracking-wide uppercase"
              style={{ color: 'hsl(var(--primary))' }}
            >
              {contact.hero.eyebrow}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-base" style={{ color: 'hsl(var(--foreground))' }}>
              {contact.hero.heading}
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {contact.hero.subheading}
            </p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-xxl">
          <div className="max-w-content mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-xl">

              {/* Left — Contact Details */}
              <div className="lg:col-span-2 flex flex-col gap-lg">
                <div>
                  <h2 className="text-2xl font-bold mb-base" style={{ color: 'hsl(var(--foreground))' }}>
                    {contact.details.heading}
                  </h2>
                  <p className="text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {contact.details.body}
                  </p>
                </div>

                <div className="flex flex-col gap-base">
                  {/* Email */}
                  <div className="flex items-start gap-base">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(var(--primary) / 0.12)' }}
                    >
                      <Mail size={20} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Email</p>
                      <a
                        href={`mailto:${contact.details.email}`}
                        className="text-sm transition-colors hover:underline"
                        style={{ color: 'hsl(var(--primary))' }}
                      >
                        {contact.details.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-base">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(var(--primary) / 0.12)' }}
                    >
                      <Phone size={20} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Phone / WhatsApp</p>
                      <a
                        href={contact.details.phoneHref}
                        className="text-sm transition-colors hover:underline"
                        style={{ color: 'hsl(var(--primary))' }}
                      >
                        {contact.details.phone}
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-base">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(var(--primary) / 0.12)' }}
                    >
                      <MapPin size={20} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Location</p>
                      <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{contact.details.location}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-base">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'hsl(var(--primary) / 0.12)' }}
                    >
                      <Clock size={20} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Response time</p>
                      <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {contact.details.hours}
                        <br />
                        {contact.details.responseTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust note */}
                <div
                  className="rounded-2xl p-base mt-auto"
                  style={{
                    background: 'hsl(var(--primary) / 0.08)',
                    border: '1px solid hsl(var(--primary) / 0.2)',
                  }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--primary))' }}>
                    {contact.trust.label}
                  </p>
                  <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {contact.trust.body}
                  </p>
                </div>
              </div>

              {/* Right — Form */}
              <div className="lg:col-span-3">
                <div
                  className="rounded-3xl p-lg shadow-sm border"
                  style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                >
                  {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-xl text-center gap-base">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'hsl(var(--primary) / 0.12)' }}
                      >
                        <CheckCircle size={32} style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <h3 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                        {contact.form.successHeading}
                      </h3>
                      <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {contact.form.successBody}
                      </p>
                      <button
                        onClick={() => setStatus('idle')}
                        className="mt-sm px-6 py-3 rounded-full text-sm font-semibold transition-colors"
                        style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                      >
                        {contact.form.successCta}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate>
                      {/* Honeypot — positioned off-screen, never included in POST body */}
                      <input
                        type="text"
                        name="_gotcha"
                        tabIndex={-1}
                        autoComplete="off"
                        style={{ position: 'absolute', left: '-9999px' }}
                        aria-hidden="true"
                      />

                      <h2 className="text-2xl font-bold mb-lg" style={{ color: 'hsl(var(--foreground))' }}>
                        {contact.form.heading}
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-base mb-base">
                        {/* Name */}
                        <div className="flex flex-col gap-xs">
                          <label
                            htmlFor="name"
                            className="text-sm font-semibold"
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            Your name <span style={{ color: 'hsl(var(--primary))' }}>*</span>
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="Priya Sharma"
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                            style={{
                              background: 'hsl(var(--background))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-xs">
                          <label
                            htmlFor="email"
                            className="text-sm font-semibold"
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            Email address <span style={{ color: 'hsl(var(--primary))' }}>*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="priya@example.com"
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                            style={{
                              background: 'hsl(var(--background))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-base mb-base">
                        {/* Phone */}
                        <div className="flex flex-col gap-xs">
                          <label
                            htmlFor="phone"
                            className="text-sm font-semibold"
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            Phone / WhatsApp
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                            style={{
                              background: 'hsl(var(--background))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col gap-xs">
                          <label
                            htmlFor="subject"
                            className="text-sm font-semibold"
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            Subject
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors appearance-none"
                            style={{
                              background: 'hsl(var(--background))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                            }}
                          >
                            <option value="General Enquiry">General Enquiry</option>
                            <option value="Order Status">Order Status</option>
                            <option value="Sizing Help">Sizing Help</option>
                            <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                            <option value="Wholesale / Bulk">Wholesale / Bulk</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="flex flex-col gap-xs mb-lg">
                        <label
                          htmlFor="message"
                          className="text-sm font-semibold"
                          style={{ color: 'hsl(var(--foreground))' }}
                        >
                          Message <span style={{ color: 'hsl(var(--primary))' }}>*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          required
                          placeholder="Tell us how we can help…"
                          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none"
                          style={{
                            background: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))',
                          }}
                        />
                      </div>

                      {status === 'error' && (
                        <p
                          className="mb-base text-sm px-4 py-3 rounded-xl"
                          role="alert"
                          style={{
                            background: 'hsl(var(--error-bg))',
                            color: 'hsl(var(--error-text))',
                          }}
                        >
                          {errorMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold text-base transition-all disabled:opacity-60"
                        style={{
                          background: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                        }}
                      >
                        {status === 'sending' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
