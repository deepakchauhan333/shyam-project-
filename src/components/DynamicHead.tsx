import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function DynamicHead({ 
  title = "AI Tools Hub - Discover the Best AI Tools and Agents",
  description = "Find and compare the best AI tools and agents. Comprehensive reviews, ratings, and insights to help you make informed decisions about AI technology.",
  image = "https://aitools-hub.com/og-image.jpg",
  type = "website"
}: Props) {
  const location = useLocation();
  const canonicalUrl = `https://aitools-hub.com${location.pathname}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}