/**
 * Site Configuration Data
 * Preserves decision attribution model & explicit user requirements.
 *
 * Attribution Sources:
 * - Theme: semantic_inference
 * - Primary Color: semantic_inference
 * - Typography: semantic_inference
 */
export const siteData = {
  "websiteIdentity": {
    "title": "Hihbug Digital",
    "businessType": "Creative Branding & Design Agency",
    "industry": "Marketing & Creative Services",
    "targetAudience": [
      "Modern startups looking for bold positioning",
      "E-commerce brands seeking creative assets"
    ]
  },
  "websiteType": "Interactive Web Application",
  "designSpec": {
    "theme": "Defiant Brutalism",
    "primaryColor": "#FF3E1A",
    "secondaryColor": "#94A3B8",
    "typography": "Outfit",
    "layoutStyle": "Responsive Container Grid",
    "sources": {
      "theme": "semantic_inference",
      "primaryColor": "semantic_inference",
      "typography": "semantic_inference",
      "visualTone": "semantic_inference"
    }
  },
  "navigationSpec": {
    "headerLinks": [
      {
        "label": "Home",
        "pageName": "Home",
        "slug": "home"
      },
      {
        "label": "Case Studies",
        "pageName": "Case Studies",
        "slug": "work"
      },
      {
        "label": "Book a Consultation",
        "pageName": "Book a Consultation",
        "slug": "book"
      }
    ],
    "footerLinks": [
      {
        "label": "Home",
        "pageName": "Home",
        "slug": "home"
      },
      {
        "label": "Case Studies",
        "pageName": "Case Studies",
        "slug": "work"
      },
      {
        "label": "Book a Consultation",
        "pageName": "Book a Consultation",
        "slug": "book"
      }
    ]
  },
  "ctaRequirements": {
    "primaryCTA": "Book Strategy Session",
    "secondaryCTA": "Explore Case Studies"
  },
  "contactRequirements": {
    "hasContactForm": true,
    "hasWhatsApp": false,
    "hasLocationDetails": false
  },
  "paymentCheckoutSpec": {
    "paymentRequired": false,
    "paymentStatus": "not_requested",
    "supportedMethods": [],
    "checkoutRequired": false,
    "checkoutStatus": "not_requested",
    "authRequired": false
  },
  "pages": [
    {
      "id": "page_home",
      "name": "Home",
      "slug": "home",
      "purpose": "Introduce the agency's creative philosophy, display top tier works, build immediate visual authority, and drive users to schedule a consultation.",
      "source": "user_requested",
      "sections": [
        {
          "id": "comp_home_0_herobanner",
          "type": "HeroBanner",
          "title": "We Design Brands That Demolish the Quiet",
          "purpose": "High-impact visual and textual positioning statement highlighting our premium creative and branding services.",
          "source": "user_requested",
          "approvedAssetId": "asset_home_sec_0_hero",
          "styles": {
            "primaryColor": "#FF3E1A",
            "secondaryColor": "#94A3B8",
            "theme": "Defiant Brutalism"
          },
          "eyebrow": "✨ Sourced Fresh, Delivered Direct",
          "trustBadges": [
            {
              "icon": "truck",
              "label": "Fast Local Delivery"
            },
            {
              "icon": "heart",
              "label": "100% Guaranteed Quality"
            },
            {
              "icon": "star",
              "label": "5.0 Star Experience"
            }
          ],
          "headline": "Defiant Brands. Irresistible Assets.",
          "subheadline": "Hihbug Digital constructs high-fidelity brand identities and digital assets for startups that refuse to blend in.",
          "primaryCTA": "Book Strategy Session",
          "secondaryCTA": "Explore Case Studies",
          "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
        },
        {
          "id": "comp_home_1_statscounter",
          "type": "StatsCounter",
          "title": "The Impact in Numbers",
          "purpose": "Quantify agency capabilities and validate results for high-growth startups and e-commerce companies.",
          "source": "user_requested",
          "approvedAssetId": null,
          "styles": {
            "primaryColor": "#FF3E1A",
            "secondaryColor": "#94A3B8",
            "theme": "Defiant Brutalism"
          },
          "stats": [
            {
              "value": "500+",
              "label": "Happy Clients"
            },
            {
              "value": "10+",
              "label": "Years Experience"
            },
            {
              "value": "99%",
              "label": "Satisfaction Rate"
            },
            {
              "value": "4.9★",
              "label": "Average Rating"
            }
          ]
        },
        {
          "id": "comp_home_2_testimonialscarousel",
          "type": "TestimonialsCarousel",
          "title": "What Bold Founders Say",
          "purpose": "Showcase real high-growth startups praising our creative output and positioning strategy.",
          "source": "user_requested",
          "approvedAssetId": null,
          "styles": {
            "primaryColor": "#FF3E1A",
            "secondaryColor": "#94A3B8",
            "theme": "Defiant Brutalism"
          },
          "testimonials": [
            {
              "quote": "Hihbug Digital delivered exceptional quality throughout. Highly recommended.",
              "author": "Satisfied Client",
              "role": "Verified Review",
              "rating": 5
            }
          ]
        }
      ]
    },
    {
      "id": "page_case_studies",
      "name": "Case Studies",
      "slug": "work",
      "purpose": "Display a rich, filterable showcase of the agency's best brand identity and asset creation projects.",
      "source": "ai_recommended",
      "sections": [
        {
          "id": "comp_work_0_itemcataloggrid",
          "type": "ItemCatalogGrid",
          "title": "The Archive of Defiance",
          "purpose": "A filterable creative catalog illustrating diverse visual problems solved for global brand clients.",
          "source": "ai_recommended",
          "approvedAssetId": null,
          "styles": {
            "primaryColor": "#FF3E1A",
            "secondaryColor": "#94A3B8",
            "theme": "Defiant Brutalism"
          },
          "subheadline": "Select a category to view how we position companies to dominate their respective markets.",
          "actionType": "ADD_TO_CART",
          "actionLabel": "Add to Cart",
          "drawerTitle": "Your Shopping Cart",
          "categories": [
            "Brand Strategy",
            "E-Commerce Assets",
            "Web Interfaces"
          ],
          "items": [
            {
              "id": "case_1",
              "name": "Vapor Energy: Re-Architecting Gen-Z Fuel",
              "category": "Brand Strategy",
              "description": "How we repositioned an organic energy drink brand with high-contrast, brutalist typography and custom 3D packaging systems.",
              "price": "Case Study",
              "badge": "Branding & Package",
              "rating": 5,
              "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80&sig=1009",
              "hasPaymentButton": false
            },
            {
              "id": "case_2",
              "name": "Aetheris Apparel: High-Velocity Content",
              "category": "E-Commerce Assets",
              "description": "Delivering 150+ high-end visual assets, custom video ads, and optimized web imagery for an eco-luxury fashion line.",
              "price": "Case Study",
              "badge": "E-Commerce Suite",
              "rating": 4.9,
              "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80&sig=1971",
              "hasPaymentButton": false
            }
          ]
        }
      ]
    },
    {
      "id": "page_book_a_consultation",
      "name": "Book a Consultation",
      "slug": "book",
      "purpose": "Allow hot prospective clients to select a package tier, schedule a strategy meeting, and submit initial brand briefs.",
      "source": "ai_recommended",
      "sections": [
        {
          "id": "comp_book_0_pricingplansgrid",
          "type": "PricingPlansGrid",
          "title": "Select Your Engagement Track",
          "purpose": "Provide clear entry points for both early-stage startup MVPs and established e-commerce brands looking for heavy retainers.",
          "source": "ai_recommended",
          "approvedAssetId": null,
          "styles": {
            "primaryColor": "#FF3E1A",
            "secondaryColor": "#94A3B8",
            "theme": "Defiant Brutalism"
          },
          "billingToggle": false,
          "plans": [
            {
              "name": "Standard Plan",
              "price": "Contact for pricing",
              "period": "",
              "description": "Essential features to get started.",
              "features": [
                "Standard Access",
                "Basic Support"
              ],
              "isPopular": false
            },
            {
              "name": "Pro Plan",
              "price": "Contact for pricing",
              "period": "",
              "description": "Advanced features for scaling operations.",
              "features": [
                "Full Access",
                "Priority Support"
              ],
              "isPopular": true
            }
          ]
        },
        {
          "id": "comp_book_1_bookingform",
          "type": "BookingForm",
          "title": "Schedule Your Free Brand Diagnostics Call",
          "purpose": "Intake client details, target goals, budget range, and desired meeting schedule to initiate deep-dive review.",
          "source": "ai_recommended",
          "approvedAssetId": null,
          "styles": {
            "primaryColor": "#FF3E1A",
            "secondaryColor": "#94A3B8",
            "theme": "Defiant Brutalism"
          },
          "fields": [
            {
              "name": "fullName",
              "label": "Full Name",
              "type": "text",
              "placeholder": "Jane Doe",
              "required": true
            },
            {
              "name": "email",
              "label": "Email Address",
              "type": "email",
              "placeholder": "jane@example.com",
              "required": true
            },
            {
              "name": "date",
              "label": "Preferred Date",
              "type": "date",
              "required": true
            },
            {
              "name": "message",
              "label": "Additional Details",
              "type": "textarea",
              "placeholder": "Tell us how we can help...",
              "required": false
            }
          ],
          "submitLabel": "Confirm Booking"
        }
      ]
    }
  ],
  "visualDesignSpec": {
    "colorMood": "dark-premium",
    "heroStyle": "split-image",
    "layoutPersonality": "structured",
    "imageryKeywords": [
      "Avant-garde 3D render",
      "High-fashion editorial",
      "Brutalist typography poster",
      "Dynamic octane lighting"
    ],
    "fontPairing": "display-bold",
    "atmosphereNotes": ""
  }
};
