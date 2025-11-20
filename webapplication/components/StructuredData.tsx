export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Heritage Lanka",
    "description": "Connect with verified local guides in Sri Lanka for authentic travel experiences",
    "url": "https://heritagelanka.com",
    "logo": "https://heritagelanka.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Sinhala", "Tamil"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Sri Lanka"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Heritage Lanka",
    "url": "https://heritagelanka.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://heritagelanka.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Tour Guide Services",
    "provider": {
      "@type": "Organization",
      "name": "Heritage Lanka"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Sri Lanka"
    },
    "description": "Connect travelers with verified local guides across Sri Lanka"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
