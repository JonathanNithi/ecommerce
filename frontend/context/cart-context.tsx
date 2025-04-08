import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define the cart item type
export type CartItem = {
    id: string
    name: string
    price: number
    image: string
    quantity: number
}

// Define the cart context type
type CartContextType = {
    items: CartItem[]
    addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void
    updateQuantity: (id: string, quantity: number) => void
    removeItem: (id: string) => void
    clearCart: () => void
    itemCount: number
    subtotal: number
    lastOrder: { id?: string } | null // Add lastOrder to the context type
    setLastOrder: (order: { id?: string } | null) => void // Function to set lastOrder
}

// Create the context with a default value
const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    updateQuantity: () => { },
    removeItem: () => { },
    clearCart: () => { },
    itemCount: 0,
    subtotal: 0,
    lastOrder: null,
    setLastOrder: () => { },
})

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext)

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
    // Initialize cart from localStorage if available
    const [items, setItems] = useState<CartItem[]>([])
    const [loaded, setLoaded] = useState(false)
    const [lastOrder, setLastOrder] = useState<{ id?: string } | null>(null); // State for the last order

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem("cart")
            if (storedCart) {
                setItems(JSON.parse(storedCart))
            }
        } catch (error) {
            console.error("Failed to load cart from localStorage:", error)
        } finally {
            setLoaded(true)
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (loaded) {
            try {
                localStorage.setItem("cart", JSON.stringify(items))
            } catch (error) {
                console.error("Failed to save cart to localStorage:", error)
            }
        }
    }, [items, loaded])

    // Add an item to the cart
    const addItem = (item: Omit<CartItem, "quantity">, quantity: number) => {
        setItems((prevItems) => {
            // Check if the item is already in the cart
            const existingItemIndex = prevItems.findIndex((i) => i.id === item.id)

            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                const updatedItems = [...prevItems]
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity,
                }
                return updatedItems
            } else {
                // Add new item if it doesn't exist
                return [...prevItems, { ...item, quantity }]
            }
        })
    }

    // Update the quantity of an item in the cart
    const updateQuantity = (id: string, quantity: number) => {
        setItems((prevItems) =>
            prevItems.map((item) => (item.id == id ? { ...item, quantity: Math.max(1, quantity) } : item)),
        )
    }

    // Remove an item from the cart
    const removeItem = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id != id))
    }

    // Clear the cart
    const clearCart = () => {
        setItems([])
    }

    // Calculate the total number of items in the cart
    const itemCount = items.reduce((total, item) => total + item.quantity, 0)

    // Calculate the subtotal
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

    // Provide the cart context to children
    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                itemCount,
                subtotal,
                lastOrder,
                setLastOrder,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}