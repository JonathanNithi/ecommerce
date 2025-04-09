export default function Loading() {
    return (
      <div className="container py-24 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image Skeleton */}
          <div className="bg-gray-200 rounded-lg aspect-square animate-pulse" />
  
          {/* Product Details Skeleton */}
          <div>
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-6 w-1/6 bg-gray-200 rounded animate-pulse mb-6" />
  
            <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-8" />
  
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }
  
  