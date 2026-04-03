import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts, categories as defaultCategories } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";
import { useUser, useAuth } from "@clerk/react";

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const { user, isSignedIn, isLoaded } = useUser();
    const { getToken } = useAuth();
    
    // Bridge Clerk state to window SYNC for the interceptor to be ready early
    window.clerk_signed_in = isSignedIn;
    window.clerk_getToken = getToken;

    // Create a stable axios instance for the entire app.
    // Registration of interceptor happens IMMEDIATELY to avoid race conditions.
    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_BACKEND_URL,
            withCredentials: true
        });

        instance.interceptors.request.use(async (config) => {
            try {
                // Accessing window-bridged Clerk state to avoid closure staleness in useMemo
                if (window.clerk_signed_in && window.clerk_getToken) {
                    const token = await window.clerk_getToken();
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log("Axios Interceptor: Attaching token to", config.url);
                }
            } catch (err) {
                console.error("Token attachment error", err);
            }
            return config;
        });

        return instance;
    }, []);

    const [isSeller, setIsSeller] = useState(false)
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState(defaultCategories)

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})

    // Fetch User Cart Items from Backend using Clerk Token
    const fetchUserData = async () => {
        try {
            if (isLoaded && isSignedIn && user) {
                const { data } = await api.get('/api/user/data');
                if (data.success) {
                    setCartItems(data.user.cartItems);
                }
            }
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    }

    // Fetch Seller Status
    const fetchSeller = async ()=>{
        try {
            const {data} = await api.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    // Fetch All Categories from Database
    const fetchCategories = async ()=>{
        try {
            const { data } = await api.get('/api/category/list')
            if(data.success && data.categories.length > 0){
                const formattedCategories = data.categories.map(cat => ({
                    text: cat.name,
                    path: cat.path,
                    image: cat.image,
                    bgColor: cat.bgColor,
                    id: cat._id
                }))
                setCategories(formattedCategories)
            }else{
                setCategories(defaultCategories)
            }
        } catch (error) {
            setCategories(defaultCategories)
        }
    }

    // Fetch All Products
    const fetchProducts = async ()=>{
        try {
            const { data } = await api.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

// Add Product to Cart
const addToCart = (itemId)=>{
    const product = products.find((p) => p._id === itemId);
    if (!product || (product.inStock === false || (product.stock !== undefined && product.stock <= 0))) {
        toast.error("This item is out of stock");
        return;
    }
    let cartData = structuredClone(cartItems);

    if(cartData[itemId]){
        cartData[itemId] += 1;
    }else{
        cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart")
}

  // Update Cart Item Quantity
  const updateCartItem = (itemId, quantity)=>{
    const product = products.find((p) => p._id === itemId);
    if (!product || (product.inStock === false || (product.stock !== undefined && product.stock <= 0))) {
        toast.error("This item is out of stock");
        return;
    }
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData)
    toast.success("Cart Updated")
  }

// Remove Product from Cart
const removeFromCart = (itemId)=>{
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId] === 0){
            delete cartData[itemId];
        }
    }
    toast.success("Removed from Cart")
    setCartItems(cartData)
}

  // Get Cart Item Count
  const getCartCount = ()=>{
    let totalCount = 0;
    for(const item in cartItems){
        totalCount += cartItems[item];
    }
    return totalCount;
  }

// Get Cart Total Amount
const getCartAmount = () =>{
    let totalAmount = 0;
    for (const items in cartItems){
        let itemInfo = products.find((product)=> product._id === items);
        if(cartItems[items] > 0){
            totalAmount += itemInfo.offerPrice * cartItems[items]
        }
    }
    return Math.floor(totalAmount * 100) / 100;
}

    useEffect(()=>{
        fetchProducts()
        fetchCategories()
        fetchSeller()
    },[])

    useEffect(()=>{
        if(isLoaded && isSignedIn && user){
            fetchUserData()
        }
    },[isLoaded, isSignedIn, user])

    // Update Database Cart Items
    useEffect(()=>{
        const updateCart = async ()=>{
            try {
                if (!isLoaded || !isSignedIn) return;
                const { data } = await api.post('/api/cart/update', {cartItems})
                if (!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                console.error("Update Cart Error", error);
            }
        }

        if(user){
            updateCart()
        }
    },[cartItems, isLoaded, isSignedIn])

    const value = {
        navigate, user, isSignedIn, isLoaded, setIsSeller, isSeller,
        products, categories, currency, addToCart, updateCartItem, removeFromCart, cartItems, 
        searchQuery, setSearchQuery, getCartAmount, getCartCount, axios: api, fetchProducts, fetchCategories, setCartItems
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}
