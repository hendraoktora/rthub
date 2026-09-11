import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ImageCacheHelper {
  // In-memory cache for decoded base64 image bytes to prevent lag on scroll
  static final Map<int, Uint8List> _base64BytesCache = {};

  static Uint8List? getBytes(String base64Str) {
    if (base64Str.isEmpty) return null;
    final hash = base64Str.hashCode;
    if (_base64BytesCache.containsKey(hash)) {
      return _base64BytesCache[hash];
    }
    try {
      final clean = base64Str.contains(',') ? base64Str.split(',')[1] : base64Str;
      final bytes = base64Decode(clean.trim());
      // Keep cache size bounded (max 100 images in memory)
      if (_base64BytesCache.length > 100) {
        _base64BytesCache.remove(_base64BytesCache.keys.first);
      }
      _base64BytesCache[hash] = bytes;
      return bytes;
    } catch (_) {
      return null;
    }
  }

  static Widget buildImage(
    String? urlOrBase64, {
    double? height,
    double? width,
    BoxFit fit = BoxFit.cover,
    BorderRadius? borderRadius,
    Widget? placeholder,
  }) {
    if (urlOrBase64 == null || urlOrBase64.trim().isEmpty) {
      return _wrapRadius(placeholder ?? _defaultPlaceholder(height, width), borderRadius);
    }

    final trimmed = urlOrBase64.trim();

    if (trimmed.startsWith('data:image') || (trimmed.length > 200 && !trimmed.startsWith('http'))) {
      final bytes = getBytes(trimmed);
      if (bytes != null) {
        return _wrapRadius(
          Image.memory(
            bytes,
            height: height,
            width: width,
            fit: fit,
            gaplessPlayback: true,
            filterQuality: FilterQuality.low,
            errorBuilder: (ctx, err, stack) => placeholder ?? _defaultPlaceholder(height, width),
          ),
          borderRadius,
        );
      }
      return _wrapRadius(placeholder ?? _defaultPlaceholder(height, width), borderRadius);
    }

    if (trimmed.startsWith('http')) {
      return _wrapRadius(
        Image.network(
          trimmed,
          height: height,
          width: width,
          fit: fit,
          gaplessPlayback: true,
          cacheWidth: (width != null && width.isFinite) ? (width * 2).toInt() : 600,
          filterQuality: FilterQuality.low,
          errorBuilder: (ctx, err, stack) => placeholder ?? _defaultPlaceholder(height, width),
          loadingBuilder: (ctx, child, progress) {
            if (progress == null) return child;
            return Container(
              height: height,
              width: width,
              color: AppTheme.slateLight,
              child: const Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.electricBlue),
                ),
              ),
            );
          },
        ),
        borderRadius,
      );
    }

    return _wrapRadius(placeholder ?? _defaultPlaceholder(height, width), borderRadius);
  }

  static Widget _wrapRadius(Widget child, BorderRadius? radius) {
    if (radius != null) {
      return ClipRRect(borderRadius: radius, child: child);
    }
    return child;
  }

  static Widget _defaultPlaceholder(double? height, double? width) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: AppTheme.slateLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(
        child: Icon(Icons.image_outlined, size: 28, color: AppTheme.textMuted),
      ),
    );
  }
}
