# Schema Types Reference

Complete JSON-LD templates for all schema types checked by IsAgentReady.com (checkpoints 2.2 and 2.3). Each template is copy-paste ready — replace placeholder values with your actual data.

## Identity Types (Checkpoint 2.2)

### Organization

Required: `name`, `url`. Bonus: `logo`, `sameAs`, `contactPoint`.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Brief description of your company",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany",
    "https://github.com/yourcompany"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@example.com",
    "contactType": "customer service",
    "availableLanguage": ["English"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Amsterdam",
    "addressCountry": "NL"
  }
}
```

### WebSite

Required: `name`, `url`.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Site Name",
  "url": "https://example.com",
  "description": "Brief site description",
  "publisher": {
    "@type": "Organization",
    "name": "Your Company"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

## Content Types (Checkpoint 2.3)

### Article

Required: `headline`.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "description": "Brief summary of the article",
  "image": "https://example.com/article-image.jpg",
  "datePublished": "2026-01-15T09:00:00+00:00",
  "dateModified": "2026-01-20T14:30:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/authors/author-name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Company",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

### NewsArticle

Required: `headline`.

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Breaking: Your News Headline",
  "description": "Summary of the news article",
  "image": "https://example.com/news-image.jpg",
  "datePublished": "2026-02-15T08:00:00+00:00",
  "dateModified": "2026-02-15T10:00:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Reporter Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "News Organization",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

### BlogPosting

Required: `headline`.

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Your Blog Post Title",
  "description": "Brief summary of the blog post",
  "image": "https://example.com/blog-image.jpg",
  "datePublished": "2026-02-10T12:00:00+00:00",
  "dateModified": "2026-02-12T09:00:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Company"
  },
  "wordCount": 1500,
  "mainEntityOfPage": "https://example.com/blog/your-post"
}
```

---

## Commerce & SaaS Types

### Product

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget Pro",
  "description": "Professional-grade widget for enterprise use",
  "image": "https://example.com/products/widget-pro.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/widget-pro"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "120"
  }
}
```

### SoftwareApplication

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Your App Name",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "description": "Brief description of what the app does",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "250"
  },
  "author": {
    "@type": "Organization",
    "name": "Your Company"
  }
}
```

### WebApplication

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Your Web App",
  "url": "https://app.example.com",
  "operatingSystem": "Any",
  "applicationCategory": "ProductivityApplication",
  "description": "Brief description",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "49",
    "priceCurrency": "USD",
    "offerCount": "3"
  }
}
```

### MobileApplication

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "Your Mobile App",
  "operatingSystem": "iOS, Android",
  "applicationCategory": "HealthApplication",
  "description": "Brief description",
  "downloadUrl": "https://apps.apple.com/app/your-app/id123456789",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## Business & Services Types

### LocalBusiness

Required: `name`, `address`.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Business Name",
  "description": "Brief description of the business",
  "image": "https://example.com/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "Amsterdam",
    "postalCode": "1012 AB",
    "addressCountry": "NL"
  },
  "telephone": "+31-20-123-4567",
  "url": "https://example.com",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "52.3676",
    "longitude": "4.9041"
  }
}
```

### Service

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Web Development Service",
  "description": "Full-stack web development for modern businesses",
  "provider": {
    "@type": "Organization",
    "name": "Your Company"
  },
  "serviceType": "Web Development",
  "areaServed": {
    "@type": "Country",
    "name": "Netherlands"
  },
  "offers": {
    "@type": "Offer",
    "price": "150",
    "priceCurrency": "EUR",
    "unitText": "per hour"
  }
}
```

### JobPosting

Required: `title`, `description`, `datePosted`, `hiringOrganization`.

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Software Engineer",
  "description": "We are looking for a senior engineer to join our platform team...",
  "datePosted": "2026-02-01",
  "validThrough": "2026-04-01",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Your Company",
    "sameAs": "https://example.com",
    "logo": "https://example.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Amsterdam",
      "addressCountry": "NL"
    }
  },
  "employmentType": "FULL_TIME",
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 70000,
      "maxValue": 95000,
      "unitText": "YEAR"
    }
  }
}
```

---

## Interactive & Engagement Types

### FAQPage

Required: `mainEntity`.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does your product do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our product helps businesses manage their workflow by automating repetitive tasks and providing real-time analytics."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a free tier and paid plans starting at $29/month. Enterprise pricing is available on request."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all paid plans include a 14-day free trial with no credit card required."
      }
    }
  ]
}
```

### QAPage

Required: `mainEntity`.

```json
{
  "@context": "https://schema.org",
  "@type": "QAPage",
  "mainEntity": {
    "@type": "Question",
    "name": "How do I reset my password?",
    "text": "I forgot my password and cannot log in. How can I reset it?",
    "answerCount": 1,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Click the 'Forgot Password' link on the login page. Enter your email address and you will receive a reset link within 5 minutes.",
      "dateCreated": "2026-01-15",
      "author": {
        "@type": "Person",
        "name": "Support Team"
      }
    }
  }
}
```

### HowTo

Required: `name`, `step`.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up Your Account",
  "description": "Step-by-step guide to getting started",
  "totalTime": "PT10M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Create an account",
      "text": "Visit example.com/signup and fill in your email and password."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Verify your email",
      "text": "Check your inbox for the verification email and click the confirmation link."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Complete your profile",
      "text": "Add your company name, role, and profile picture."
    }
  ]
}
```

### Course

Required: `name`, `description`.

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Introduction to Machine Learning",
  "description": "Learn the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.",
  "provider": {
    "@type": "Organization",
    "name": "Your Academy"
  },
  "courseCode": "ML-101",
  "educationalLevel": "Beginner",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "courseWorkload": "PT20H"
  },
  "offers": {
    "@type": "Offer",
    "price": "199",
    "priceCurrency": "USD"
  }
}
```

---

## Media & Events Types

### VideoObject

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Product Demo: Widget Pro in Action",
  "description": "Watch how Widget Pro streamlines your workflow in under 3 minutes.",
  "thumbnailUrl": "https://example.com/video-thumb.jpg",
  "uploadDate": "2026-01-10T08:00:00+00:00",
  "duration": "PT2M45S",
  "contentUrl": "https://example.com/videos/demo.mp4",
  "embedUrl": "https://www.youtube.com/embed/abc123"
}
```

### Event

Required: `name`, `startDate`.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Annual Tech Conference 2026",
  "description": "Join industry leaders for talks on AI, cloud, and developer tooling.",
  "startDate": "2026-06-15T09:00:00+02:00",
  "endDate": "2026-06-17T18:00:00+02:00",
  "location": {
    "@type": "Place",
    "name": "RAI Amsterdam",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Europaplein 24",
      "addressLocality": "Amsterdam",
      "addressCountry": "NL"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Your Company"
  },
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "EUR",
    "url": "https://example.com/conference/tickets",
    "availability": "https://schema.org/InStock"
  },
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
}
```

### Recipe

Required: `name`.

```json
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Classic Dutch Apple Pie",
  "description": "Traditional Dutch apple pie with a buttery crust and cinnamon-spiced filling.",
  "image": "https://example.com/recipes/apple-pie.jpg",
  "prepTime": "PT30M",
  "cookTime": "PT45M",
  "totalTime": "PT1H15M",
  "recipeYield": "8 servings",
  "recipeIngredient": [
    "250g flour",
    "150g butter",
    "100g sugar",
    "4 apples",
    "1 tsp cinnamon"
  ],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "text": "Preheat oven to 180°C. Mix flour, butter, and sugar into a dough."
    },
    {
      "@type": "HowToStep",
      "text": "Peel and slice the apples. Toss with cinnamon and sugar."
    },
    {
      "@type": "HowToStep",
      "text": "Press dough into pie dish, add apple filling, cover with lattice top."
    },
    {
      "@type": "HowToStep",
      "text": "Bake for 45 minutes until golden brown."
    }
  ],
  "author": {
    "@type": "Person",
    "name": "Chef Name"
  }
}
```

---

## Navigation Type

### BreadcrumbList

Required: `itemListElement` (each item needs `position`, `name`, `item`).

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://example.com/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Widget Pro",
      "item": "https://example.com/products/widget-pro"
    }
  ]
}
```
