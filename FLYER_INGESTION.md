# Flyer ingestion notes

PriceMatch is prepared to display real flyer image/PDF pages, but this repository must only include flyer assets that are user-provided, partner-provided, licensed, or otherwise legally available.

Do not scrape Flipp, retailer sites, or hard-code third-party flyer image URLs without permission. Future real flyer ingestion should place licensed page images under `public/real-flyers/<store-key>/page-1.jpg` (or generated PDF page images), then generate product bounding boxes through OCR/vision or manual mapping. Until those assets exist, the app labels the built-in SVG pages as demo flyers and treats product coordinates as mapped demo data.
