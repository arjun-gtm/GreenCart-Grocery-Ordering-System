import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import toast from 'react-hot-toast';

const ProductDetails = () => {

    const {products, navigate, currency, addToCart, updateCartItem, cartItems} = useAppContext()
    const {id} = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const product = products.find((item)=> item._id === id);
    const available = product ? (product.inStock !== false && (product.stock === undefined || product.stock > 0)) : true;
    const cartItem = product && cartItems?.[product._id] ? cartItems[product._id] : 0;
    const maxStock = product?.stock ?? 0;
    const canAddMore = available && (cartItem + quantity <= maxStock);

    useEffect(()=>{
        if(products.length > 0 && product){
            const productsCopy = products.filter(
                (item) => item.category === product.category && item._id !== product._id
            )
            setRelatedProducts(productsCopy.filter((p) => p.inStock !== false && (p.stock === undefined || p.stock > 0)).slice(0, 5))
        }
    },[products, product, id])

    useEffect(()=>{
        setThumbnail(product?.image[0] ? product.image[0] : null)
        setQuantity(1);
    },[product])


    return product && (
        <div className="mt-12">
            <p>
                <Link to={"/"}>Home</Link> /
                <Link to={"/products"}> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`}> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {product.image.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                          <img src={i<4 ? assets.star_icon : assets.star_dull_icon} alt="" className="md:w-4 w-3.5"/>
                             
                        ))}
                        <p className="text-base ml-2">(4)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{product.price}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{product.offerPrice}</p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    {!available && (
                        <p className="mt-8 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-4 py-3">
                            This item is currently out of stock. You can still view details; check back later.
                        </p>
                    )}

                    {available && maxStock > 0 && (
                        <div className="mt-6">
                            <p className="text-sm font-medium text-gray-700">
                                Stock Available: <span className="font-bold text-primary">{maxStock}</span>
                            </p>
                            {cartItem > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {cartItem === 1 ? `${cartItem} in cart` : `${cartItem} in cart`} • {maxStock - cartItem} available to add
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-8">
                        <p className="text-sm font-medium">Quantity:</p>
                        <div className='flex items-center rounded-xl border border-gray-300 overflow-hidden'>
                            <button
                                type='button'
                                disabled={quantity <= 1}
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className={`px-3 py-2 transition ${quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                -
                            </button>
                            <span className='px-4 py-2 min-w-[3rem] text-center text-gray-700 font-medium'>{quantity}</span>
                            <button
                                type='button'
                                disabled={!canAddMore}
                                onClick={() => {
                                    const newQuantity = quantity + 1;
                                    const totalInCart = cartItem + newQuantity;
                                    if (totalInCart > maxStock) {
                                        toast.error(`Only ${maxStock} item${maxStock === 1 ? '' : 's'} in stock`);
                                    } else {
                                        setQuantity(newQuantity);
                                    }
                                }}
                                className={`px-3 py-2 transition ${!canAddMore ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center mt-10 gap-4 text-base">
                <button
                    type="button"
                    disabled={!available || !canAddMore}
                    onClick={() => {
                        if (!available || !canAddMore) {
                            if (!available) {
                                toast.error("This item is out of stock");
                            } else {
                                toast.error(`Only ${maxStock - cartItem} item${maxStock - cartItem === 1 ? '' : 's'} left in stock`);
                            }
                            return;
                        }
                        const newQuantity = cartItem + quantity;
                        updateCartItem(product._id, newQuantity);
                    }}
                    className={`w-full py-3.5 font-medium transition ${
                        available && canAddMore
                            ? "cursor-pointer bg-gray-100 text-gray-800/80 hover:bg-gray-200"
                            : "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    }`}
                >
                    {!available ? "Out of stock" : !canAddMore ? "No stock left" : "Add to Cart"}
                </button>
                <button
                    type="button"
                    disabled={!available || !canAddMore}
                    onClick={() => {
                        if (!available || !canAddMore) {
                            if (!available) {
                                toast.error("This item is out of stock");
                            } else {
                                toast.error(`Only ${maxStock - cartItem} item${maxStock - cartItem === 1 ? '' : 's'} left in stock`);
                            }
                            return;
                        }
                        const newQuantity = cartItem + quantity;
                        updateCartItem(product._id, newQuantity);
                        navigate("/cart");
                    }}
                    className={`w-full py-3.5 font-medium transition ${
                        available && canAddMore
                            ? "cursor-pointer bg-primary text-white hover:bg-primary-dull"
                            : "cursor-not-allowed bg-neutral-300 text-neutral-500"
                    }`}
                >
                    Buy now
                </button>
            </div>
            {/* ---------- related products -------------- */}
            <div className="flex flex-col items-center mt-20">
                <div className="flex flex-col items-center w-max">
                    <p className="text-3xl font-medium">Related Products</p>
                    <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
                    {relatedProducts.filter((product)=>product.inStock).map((product, index)=>(
                        <ProductCard key={index} product={product}/>
                    ))}
                </div>
                <button onClick={()=> {navigate('/products'); scrollTo(0,0)}} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">See more</button>
            </div>
        </div>
    );
};


export default ProductDetails