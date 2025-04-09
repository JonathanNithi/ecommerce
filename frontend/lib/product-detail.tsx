import Image from "next/image";

export default function ProductDetail() {
  return (
    <div className="">
      <div className="max-w-4xl mx-auto shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="text-center lg:hidden">
            <h2 className="text-2xl my-2 font-bold md:text-4xl text-blue-900 dark:text-blue-200">Seeds of Change Organic Red Rice</h2>
            <p className="text-gray-500 text-sm md:text-base dark:text-white">Food Category</p>
            <p className="text-lg text-gray-700 mt-2">
              <span className="text-blue-500 text-xl md:text-2xl font-bold"> Rs. 160.00</span>
            </p>
            <div className="mt-4 flex items-center justify-center mx-auto">
              <input type="number" min="1" defaultValue="1" className="border rounded-md w-16 p-2" />
              <button className="ml-4 text-sm md:text-base bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add to Cart
              </button>
            </div>
          </div>
          <div>
            <Image
              src="/images/images_auto_care/Aer_Air_Freshner_Gel_Cool_-_9.00_ml.jpg"
              alt="Product Image"
              width={500} // Set the width of the image
              height={500} // Set the height of the image
              className="w-full h-auto md:w-[60%] rounded-lg shadow-md mx-auto"
            />
          </div>
          <div className="text-center hidden lg:block">
            <h2 className="text-3xl my-2 font-bold text-blue-900 dark:text-blue-200">Seeds of Change Organic Red Rice</h2>
            <p className="text-gray-500 text-lg dark:text-white">Food Category</p>
            <p className="text-lg text-gray-700 mt-2">
              <span className="text-blue-500 text-2xl text-lg font-semibold"> Rs. 160.00</span>
            </p>
            <div className="mt-4 flex items-center justify-center mx-auto">
              <input type="number" min="1" defaultValue="1" className="border rounded-md w-16 p-2" />
              <button className="ml-4 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold md:text-2xl md:font-bold text-blue-900 dark:text-blue-200">Description</h3>
          <p className="text-gray-600 text-md md:text-lg lg:text-base mt-2 dark:text-white">
            Unbridled carnality bland plaind in whimsical door garlic loads depending and much veils gift far or quartad goodness and from far grimaced goodness successfully and meadowlark near unblinking crucial laptop friendly watch for space for. 
          </p>
        </div>
      </div>
    </div>
  );
}
