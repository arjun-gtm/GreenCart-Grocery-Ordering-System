import { useNavigate } from "react-router-dom";

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center mt-32 px-4 gap-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
            <div>
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">Payment Failed</h1>
                <p className="text-gray-500 max-w-md mx-auto">Unfortunately, there was an issue processing your payment. Your order was not completed.</p>
            </div>
            <div className="flex gap-4 mt-4">
                <button 
                    onClick={() => navigate('/cart')}
                    className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary-dull transition"
                >
                    Return to Cart
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default PaymentFailure;
