import type { AmazonProduct } from '../constants/amazonProducts';

interface AmazonAdCardProps {
  product: AmazonProduct;
  position?: 'left' | 'right';
}

const AmazonAdCard = ({ product, position = 'left' }: AmazonAdCardProps) => {
  return (
    <div className="sticky top-24">
      <div className="overflow-hidden transition-all duration-300 bg-white border-2 border-orange-200 shadow-lg rounded-xl hover:shadow-xl hover:border-orange-300">
        {/* Sponsored Badge */}
        <div className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Sponsored
          </span>
        </div>

        {/* Product Image */}
        <div className="relative bg-white">
          <img
            src={product.image}
            alt={product.title}
            className="object-contain w-full h-48 p-4"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
            {product.title}
          </h3>
          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Amazon Link */}
          <a
            href={product.amazonLink}
            target="_blank"
            rel="nofollow noopener sponsored"
            className="flex items-center justify-center w-full px-4 py-2 mt-3 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <img src="/amazon.png" alt="Amazon" className="w-10 h-10 mr-1.5" />
            View on Amazon
          </a>

          {/* Disclaimer */}
          <p className="mt-2 text-xs text-gray-500">
            As an Amazon Associate, we earn from qualifying purchases
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazonAdCard;
