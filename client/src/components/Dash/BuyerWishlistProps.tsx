import { Heart, ShoppingBag, X, Star } from "lucide-react";

interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  inStock: boolean;
  addedDate: string;
}

interface BuyerWishlistProps {
  items: WishlistItem[];
  onRemoveItem?: (id: number) => void;
  onAddToCart?: (item: WishlistItem) => void;
}

export default function BuyerWishlist({
  items,
  onRemoveItem,
  onAddToCart,
}: BuyerWishlistProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#EF837B]/10 border border-[#EF837B]/20 rounded-lg">
            <Heart className="w-5 h-5 text-[#EF837B]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Wishlist</h2>
        </div>

        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No items in your wishlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EF837B]/10 border border-[#EF837B]/20 rounded-lg">
            <Heart className="w-5 h-5 text-[#EF837B]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Wishlist</h2>
            <p className="text-sm text-gray-600">{items.length} items</p>
          </div>
        </div>
      </div>

      {/* Wishlist Items - Compact Inline */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 border border-gray-300 rounded-lg hover:border-gray-900 transition-colors"
          >
            {/* Product Image */}
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={() => onRemoveItem?.(item.id)}
                className="absolute -top-2 -right-2 p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3 text-gray-700" />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-1 text-sm">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs text-gray-600">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        item.inStock ? "text-[#3399FF]" : "text-gray-500"
                      }`}
                    >
                      {item.inStock ? "• In Stock" : "• Out of Stock"}
                    </div>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <div className="font-bold text-gray-900">
                    ETB {item.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Added {formatDate(item.addedDate)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3">
                <button
                  onClick={() => onAddToCart?.(item)}
                  disabled={!item.inStock}
                  className={`w-full py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    item.inStock
                      ? "bg-[#3399FF] text-white hover:bg-[#2a85e6]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {item.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {items.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total value:{" "}
              <span className="font-bold text-gray-900">
                ETB{" "}
                {items
                  .reduce((sum, item) => sum + item.price, 0)
                  .toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                const inStockItems = items.filter((item) => item.inStock);
                inStockItems.forEach((item) => onAddToCart?.(item));
              }}
              disabled={!items.some((item) => item.inStock)}
              className="text-sm text-[#3399FF] hover:text-[#2a85e6] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add all to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
