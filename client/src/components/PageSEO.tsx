import { useEffect } from "react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PageSEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: "website" | "article" | "profile";
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown>;
}

const DOMAIN = "https://skillswap.io";

export function PageSEO({
  title,
  description,
  canonicalPath = "",
  type = "website",
  breadcrumbs,
  jsonLd,
}: PageSEOProps) {
  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title.includes("SkillSwap")
      ? title
      : `${title} — SkillSwap`;
    document.title = formattedTitle;

    // Helper to get or create a tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        const [attrName, attrVal] = selector
          .replace(/^meta\[/, "")
          .replace(/\]$/, "")
          .split("=");
        element.setAttribute(attrName, attrVal.replace(/['"]/g, ""));
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    // 2. Meta description
    setMeta('meta[name="description"]', "content", description);

    // 3. Canonical URL
    const canonicalUrl = `${DOMAIN}${canonicalPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // 4. OpenGraph tags
    setMeta('meta[property="og:title"]', "content", formattedTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:type"]', "content", type);

    // 5. Twitter tags
    setMeta('meta[name="twitter:title"]', "content", formattedTitle);
    setMeta('meta[name="twitter:description"]', "content", description);

    // 6. Dynamic JSON-LD (Breadcrumbs / Page Schema)
    const schemaElements: HTMLScriptElement[] = [];

    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbScript = document.createElement("script");
      breadcrumbScript.type = "application/ld+json";
      breadcrumbScript.id = "schema-breadcrumbs";
      breadcrumbScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url.startsWith("http") ? item.url : `${DOMAIN}${item.url}`,
        })),
      });
      document.head.appendChild(breadcrumbScript);
      schemaElements.push(breadcrumbScript);
    }

    if (jsonLd) {
      const customScript = document.createElement("script");
      customScript.type = "application/ld+json";
      customScript.id = "schema-custom";
      customScript.text = JSON.stringify(jsonLd);
      document.head.appendChild(customScript);
      schemaElements.push(customScript);
    }

    return () => {
      schemaElements.forEach((el) => el.remove());
    };
  }, [title, description, canonicalPath, type, breadcrumbs, jsonLd]);

  return null;
}
