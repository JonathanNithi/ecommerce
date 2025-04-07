export default function Loading() {
    return (
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
  
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full md:w-[300px] bg-gray-200 rounded animate-pulse" />
        </div>
  
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-gray-200">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="mt-2 h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  