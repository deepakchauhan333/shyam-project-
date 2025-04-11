import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  schema?: object;
  noindex?: boolean;
  canonical?: string;
  alternateLanguages?: {
    lang: string;
    url: string;
  }[];
}

export function SEO({
  title,
  description = "Discover the best AI tools and agents for your needs",
  image = 'https://aitoonic.com/og-image.jpg',
  type = 'website',
  schema,
  noindex = false,
  canonical,
  alternateLanguages = []
}: SEOProps) {
  const location = useLocation();
  const siteUrl = 'https://aitoonic.com';
  const currentUrl = `${siteUrl}${location.pathname}`;
  const canonicalUrl = canonical || currentUrl;

  // Base schema
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aitoonic',
    url: siteUrl,
    description: 'Discover the best AI tools and agents for your needs',
  };

  // Merge with custom schema if provided
  const fullSchema = schema ? [baseSchema, schema] : [baseSchema];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang Tags */}
      {alternateLanguages.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//i.imgur.com" />

      {/* Preconnect */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://i.imgur.com" crossOrigin="anonymous" />

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(fullSchema)}
      </script>
    </Helmet>
  );
}