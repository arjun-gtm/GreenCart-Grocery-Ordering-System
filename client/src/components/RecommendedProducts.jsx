import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from './ProductCard';

const RecommendedProducts = () => {
    const { axios, user, isLoaded } = useAppContext();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!isLoaded) return; // Wait until auth state is determined
            
            try {
                let url = '/api/product/recommendations';
                if (user && user.id) {
                    url += `?userId=${user.id}`;
                }
                
                const { data } = await axios.get(url);
                if (data.success) {
                    setRecommendations(data.products);
                }
            } catch (error) {
                console.error("Error fetching recommendations: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [isLoaded, user, axios]);

    if (!loading && recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-16">
            <div className='flex flex-col items-center mb-8'>
                <h2 className='text-3xl font-semibold text-gray-800 uppercase text-center w-full'>
                    Recommended for You
                </h2>
                <div className='w-24 h-1 bg-primary rounded-full mt-2'></div>
                <p className='text-gray-500 mt-3 text-center'>
                    Handpicked products based on your preferences
                </p>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6'>
                    {recommendations.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default RecommendedProducts;
