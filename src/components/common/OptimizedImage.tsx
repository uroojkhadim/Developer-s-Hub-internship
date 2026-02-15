import React, { useState, useCallback } from 'react';
import { Image as RNImage, View, StyleSheet } from 'react-native';
import type { ImageProps as RNImageProps } from 'react-native';

interface OptimizedImageProps extends Omit<RNImageProps, 'source'> {
  source: string | { uri: string };
  fallbackSource?: string | { uri: string };
  thumbnailSource?: string | { uri: string };
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMethod?: 'auto' | 'resize' | 'scale';
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  fallbackSource,
  thumbnailSource,
  width,
  height,
  borderRadius = 0,
  resizeMethod = 'resize',
  resizeMode = 'cover',
  style,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [error, setError] = useState(false);

  const onError = useCallback(() => {
    setError(true);
  }, []);

  const onLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const onThumbnailLoad = useCallback(() => {
    setThumbnailLoaded(true);
  }, []);

  // Normalize source to always be an object with uri
  const normalizedSource = typeof source === 'string' ? { uri: source } : source;
  const normalizedFallbackSource = fallbackSource 
    ? (typeof fallbackSource === 'string' ? { uri: fallbackSource } : fallbackSource) 
    : null;
  const normalizedThumbnailSource = thumbnailSource 
    ? (typeof thumbnailSource === 'string' ? { uri: thumbnailSource } : thumbnailSource) 
    : null;

  const imageStyleArray = [
    styles.image,
    width != null && { width },
    height != null && { height },
    borderRadius != null && { borderRadius },
    style,
  ];
  
  const imageStyles = imageStyleArray.reduce((acc, curr) => {
    if (curr) acc.push(curr);
    return acc;
  }, [] as any[]);

  return (
    <View style={[styles.container, width != null && { width }, height != null && { height }]}>
      {/* Thumbnail image shown while main image loads */}
      {normalizedThumbnailSource && !loaded && !error && (
        <RNImage
          source={normalizedThumbnailSource}
          style={imageStyles}
          resizeMode={resizeMode}
          resizeMethod={resizeMethod}
          onLoad={onThumbnailLoad}
          onError={onError}
        />
      )}

      {/* Main image */}
      <RNImage
        source={error && normalizedFallbackSource ? normalizedFallbackSource : normalizedSource}
        style={[
          ...imageStyles,
          (!loaded && normalizedThumbnailSource) ? styles.placeholder : {},
          { opacity: loaded ? 1 : 0 },
        ]}
        resizeMode={resizeMode}
        resizeMethod={resizeMethod}
        onLoad={onLoad}
        onError={onError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    opacity: 0.3,
  },
});

export default OptimizedImage;