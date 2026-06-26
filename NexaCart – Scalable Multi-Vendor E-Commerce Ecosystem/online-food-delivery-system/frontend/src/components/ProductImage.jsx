import React, { useState, useEffect } from 'react';

const DEFAULT_FOOD_PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

const ProductImage = ({ product, className = "", alt = "" }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [loadStage, setLoadStage] = useState(1); // 1: Local Path, 2: Seeded URL, 3: Default Placeholder

  const getLocalPath = (name) => {
    if (!name) return "";
    // Convert to lowercase and replace spaces/special characters with underscores
    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    return `/products/${cleanName}.jpg`;
  };

  useEffect(() => {
    // Reset state when product changes
    setLoadStage(1);
    const localPath = getLocalPath(product?.name);
    setImgSrc(localPath);
  }, [product]);

  const handleError = () => {
    if (loadStage === 1) {
      // Stage 1 failed (local image missing), try Seeded Database image URL
      setLoadStage(2);
      const dbUrl = product?.images && product.images.length > 0 
        ? product.images[0].imageUrl 
        : DEFAULT_FOOD_PLACEHOLDER;
      setImgSrc(dbUrl);
    } else if (loadStage === 2) {
      // Stage 2 failed (internet link broken), try default placeholder
      setLoadStage(3);
      setImgSrc(DEFAULT_FOOD_PLACEHOLDER);
    }
  };

  return (
    <img
      src={imgSrc || DEFAULT_FOOD_PLACEHOLDER}
      alt={alt || product?.name || "Food Product"}
      onError={handleError}
      loading="lazy"
      className={`${className} transition-opacity duration-300`}
    />
  );
};

export default ProductImage;
