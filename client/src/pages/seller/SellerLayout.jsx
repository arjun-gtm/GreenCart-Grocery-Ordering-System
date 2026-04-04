import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useState } from "react";
import { MdDashboard, MdAddBox, MdListAlt, MdShoppingCart, MdApps, MdAdminPanelSettings } from "react-icons/md";

const SellerLayout = () => {

    const { axios, navigate, adminRole, setAdminRole, setIsSeller } = useAppContext();
    const [logoutConfirm, setLogoutConfirm] = useState(false);


    const sidebarLinks = [
        { name: "Dashboard", path: "/seller/dashboard", icon: MdDashboard, isIcon: true },
        { name: "Add Product", path: "/seller/add-product", icon: MdAddBox, isIcon: true },
        { name: "Product List", path: "/seller/product-list", icon: MdListAlt, isIcon: true },
        { name: "Categories", path: "/seller/category-list", icon: MdApps, isIcon: true },
        { name: "Orders", path: "/seller/orders", icon: MdShoppingCart, isIcon: true },
        ...(adminRole === 'superadmin' ? [{ name: "Admins", path: "/seller/admins", icon: MdAdminPanelSettings, isIcon: true }] : []),
    ];

    const handleLogoutClick = () => {
        setLogoutConfirm(true);
    }

    const confirmLogout = async () => {
        try {
            const { data } = await axios.get('/api/seller/logout');
            if(data.success){
                toast.success(data.message)
                setLogoutConfirm(false);
                setIsSeller(false)
                setAdminRole(null)
                navigate('/')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelLogout = () => {
        setLogoutConfirm(false);
    }

    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <Link to='/'>
                    <img src={assets.logo} alt="log" className="cursor-pointer w-34 md:w-38" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <div className="flex flex-col items-end">
                        <p className="text-xs font-bold uppercase text-primary tracking-tighter leading-none">{adminRole === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                        <p className="text-sm font-medium">Hi! Welcome</p>
                    </div>
                    <button onClick={handleLogoutClick} className='border rounded-full text-sm px-4 py-1 cursor-pointer hover:bg-gray-100 transition'>Logout</button>
                </div>
            </div>
            <div className="flex">
               <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col">
                {sidebarLinks.map((item) => (
                    <NavLink to={item.path} key={item.name} end={item.path === "/seller/dashboard"}
                        className={({isActive})=>`flex items-center py-3 px-4 gap-3 
                            ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white"
                            }`
                        }
                    >
                        {item.isIcon ? (
                            <item.icon size={28} />
                        ) : (
                            <img src={item.icon} alt="" className="w-7 h-7" />
                        )}
                        <p className="md:block hidden text-center">{item.name}</p>
                    </NavLink>
                ))}
            </div> 
                <Outlet/>
            </div>
            
            {/* Logout Confirmation Modal */}
            {logoutConfirm && (
                <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout? You will need to login again to access the admin panel.</p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={cancelLogout}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellerLayout;