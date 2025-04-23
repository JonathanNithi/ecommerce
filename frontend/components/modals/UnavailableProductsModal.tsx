// components/modals/UnavailableProductsModal.tsx
import { Button } from "@/components/ui/button";

interface UnavailableProduct {
    id: string;
    name?: string;
}

interface UnavailableProductsModalProps {
    isOpen: boolean;
    unavailableProducts: UnavailableProduct[];
    onClose: () => void;
}

const UnavailableProductsModal: React.FC<UnavailableProductsModalProps> = ({
    isOpen,
    unavailableProducts,
    onClose,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">Unavailable Products</h2>
                {unavailableProducts.length > 0 ? (
                    <ul>
                        {unavailableProducts.map((product) => (
                            <li key={product.id} className="mb-2">
                                {product.name ? `${product.name} (ID: ${product.id})` : `Product ID: ${product.id}`} is currently unavailable.
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No products in your cart are currently unavailable.</p>
                )}
                <div className="mt-4 flex justify-end">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnavailableProductsModal;