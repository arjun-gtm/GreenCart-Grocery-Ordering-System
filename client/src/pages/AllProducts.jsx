import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { assets } from '../assets/assets'

const AllProducts = () => {

    const { products, searchQuery, setSearchQuery, axios } = useAppContext()
    const [filteredProducts, setFilteredProducts] = useState([])
    const [sortOption, setSortOption] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            if (searchQuery.trim().length > 0) {
                try {
                    const { data } = await axios.get(`/api/product/search?q=${searchQuery}`);
                    if (data.success) {
                        setFilteredProducts(data.products);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                if (!sortOption) {
                    // Default to using the context's pre-fetched products (newest first)
                    setFilteredProducts(products);
                } else {
                    try {
                        const { data } = await axios.get(`/api/product/list?sort=${sortOption}`);
                        if (data.success) {
                            setFilteredProducts(data.products);
                        }
                    } catch (error) {
                        console.error("Sort error:", error);
                        setFilteredProducts(products);
                    }
                }
            }
        }

        // Simple debounce
        const delaySearch = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(delaySearch);

    }, [products, searchQuery, sortOption, axios])

    return (
        <div className='mt-16 flex flex-col'>
            <div className='flex sm:flex-row flex-col sm:items-center justify-between gap-4'>
                <div className='flex flex-col items-start w-max'>
                    <p className='text-2xl font-medium uppercase'>
                        {searchQuery ? `Search results for "${searchQuery}"` : "All products"}
                    </p>
                    <div className='w-16 h-0.5 bg-primary rounded-full mt-1'></div>
                </div>

                {!searchQuery && (
                    <div className="relative group w-full sm:w-auto mt-2 sm:mt-0">
                        <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value)} 
                            className="appearance-none w-full sm:w-auto pl-5 pr-12 py-2.5 bg-white border border-gray-200 rounded-full cursor-pointer text-sm font-medium outline-none text-gray-700 shadow-sm hover:shadow-md hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        >
                            <option value="">Sort by: Latest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="popularity">Popularity</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-hover:text-primary transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
                {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} highlight={searchQuery} />
                ))}
            </div>

            {searchQuery && filteredProducts.length === 0 && (
                <div className='flex flex-col items-center justify-center py-24 text-center animate-fadeIn'>
                    <div className='bg-gray-50 p-8 rounded-full mb-6 border border-gray-100 shadow-sm'>
                        <img src={assets.search_icon} alt="No results" className='w-16 h-16 opacity-10 grayscale' />
                    </div>
                    <h3 className='text-2xl font-semibold text-gray-800'>No results for "{searchQuery}"</h3>
                    <p className='text-gray-500 mt-2 max-w-sm mx-auto'>
                        We couldn't find anything matching your search. <br />
                        Try a different keyword or browse our categories.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setSearchQuery("")}
                            className='px-8 py-2.5 bg-primary cursor-pointer text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all active:scale-95'
                        >
                            Clear Search
                        </button>
                    </div>
                </div>
            )}

        </div>
    )

}

export default AllProducts
