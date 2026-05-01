import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setCartItems, axios } = useAppContext();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pidx = urlParams.get("pidx");
            const orderId = sessionStorage.getItem("currentOrderId");

            if (pidx && orderId) {
                // Determine if it was Khalti returned call
                try {
                    const { data } = await axios.post('/api/payment/khalti-verify', { pidx, orderId });
                    if (data.success) {
                        toast.success("Payment successful via Khalti!");
                        setCartItems({});
                        localStorage.removeItem('cartItems');
                        sessionStorage.removeItem("currentOrderId");
                        window.history.replaceState({}, document.title, "/payment-success");
                    } else {
                        toast.error(data.message || "Khalti verification failed");
                        navigate('/payment-failure');
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || "Payment verification error");
                    navigate('/payment-failure');
                }
            } else {
                // If there's no pidx, navigate to failure as verification cannot proceed
                navigate('/payment-failure');
            }
            setVerifying(false);
        };
        verifyPayment();
    }, []);

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center mt-32 px-4 gap-6 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-xl font-medium text-gray-700">Verifying Payment...</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center mt-32 px-4 gap-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <div>
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 max-w-md mx-auto">Your order has been placed and payment was received. Thank you for shopping with us!</p>
            </div>
            <div className="flex gap-4 mt-4">
                <button 
                    onClick={() => navigate('/my-orders')}
                    className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary-dull transition"
                >
                    View Orders
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
