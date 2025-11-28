const nextConfig = {
  images: {
    remotePatterns: [
      // 楽天の画像ドメイン許可
      {
        protocol: 'https',
        hostname: 'thumbnail.image.rakuten.co.jp',
      },
      // Yahoo!ショッピングの画像ドメイン許可
      {
        protocol: 'https',
        hostname: 'item-shopping.c.yimg.jp',
      },
      // Amazonの画像ドメイン許可
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      // Unsplash (テスト用)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // DiceBear (アバター用)
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

module.exports = nextConfig;