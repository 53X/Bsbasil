import { z } from 'zod';
export const schemas = {
  pages: {
    about: z.object({
      "values": z.array(z.object({
        "title": z.string(),
        "description": z.string(),
        "color": z.string(),
        "bg": z.string(),
        "id": z.string()
      })),
      "badges": z.array(z.object({
        "label": z.string(),
        "id": z.string()
      }))
    }),
    catalog: z.object({
      "hero": z.object({
        "title": z.string(),
        "subtitle": z.string()
      }),
      "products": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "category": z.string(),
        "ageRange": z.string(),
        "price": z.string(),
        "badge": z.string(),
        "image": z.string(),
        "alt": z.string()
      }))
    }),
    home: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "title": z.string(),
        "subtitle": z.string(),
        "cta": z.string(),
        "ctaSecondary": z.string()
      }),
      "trustBadges": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "featuredSection": z.object({
        "title": z.string(),
        "subtitle": z.string()
      }),
      "featured": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "price": z.string(),
        "badge": z.string(),
        "ageRange": z.string(),
        "image": z.string(),
        "alt": z.string()
      })),
      "ageSection": z.object({
        "title": z.string(),
        "subtitle": z.string()
      }),
      "ageGroups": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "range": z.string(),
        "emoji": z.string()
      })),
      "ctaBanner": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "cta": z.string()
      }),
      "whyUs": z.object({
        "title": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "icon": z.string(),
          "title": z.string(),
          "desc": z.string()
        }))
      })
    }),
    contact: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "heading": z.string(),
        "subheading": z.string()
      }),
      "details": z.object({
        "heading": z.string(),
        "body": z.string(),
        "email": z.string(),
        "phone": z.string(),
        "phoneHref": z.string(),
        "location": z.string(),
        "hours": z.string(),
        "responseTime": z.string()
      }),
      "trust": z.object({
        "label": z.string(),
        "body": z.string()
      }),
      "form": z.object({
        "heading": z.string(),
        "successHeading": z.string(),
        "successBody": z.string(),
        "successCta": z.string()
      })
    }),
    checkout_success: z.object({
      "errors": z.object({
        "no_session": z.string(),
        "invalid_format": z.string(),
        "payment_not_completed": z.string(),
        "session_expired": z.string(),
        "still_processing": z.string(),
        "unexpected_state": z.string(),
        "verification_failed": z.string()
      })
    }),
    terms_of_use: z.object({
      "meta": z.object({
        "title": z.string(),
        "description": z.string()
      }),
      "hero": z.object({
        "heading": z.string(),
        "lastUpdated": z.string()
      }),
      "intro": z.object({
        "text": z.string()
      }),
      "sections": z.array(z.object({
        "id": z.string(),
        "heading": z.string(),
        "body": z.array(z.object({
          "id": z.string(),
          "text": z.string()
        }))
      }))
    }),
    faq: z.object({
      "hero": z.object({
        "title": z.string(),
        "subtitle": z.string()
      }),
      "categories": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "faqs": z.array(z.object({
          "id": z.string(),
          "question": z.string(),
          "answer": z.string()
        }))
      })),
      "cta": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "whatsappText": z.string(),
        "emailText": z.string()
      })
    })
  }
};
export type Schemas = typeof schemas;