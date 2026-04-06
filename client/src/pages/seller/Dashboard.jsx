import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'
import { MdShoppingCart, MdAttachMoney, MdTrendingUp, MdInventory2, MdClose, MdHourglassEmpty, MdPeople, MdWarning, MdShowChart, MdFileDownload } from 'react-icons/md'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const Dashboard = () => {
    const { currency, axios, products, navigate } = useAppContext()
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        paidOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalCategories: 0,
        recentOrders: []
    })
    const [analytics, setAnalytics] = useState({
        dailyStats: [],
        topSellingProducts: [],
        lowStockProducts: [],
        monthlyStats: []
    })
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch baseline stats and analytics in parallel
            const [ordersRes, categoryRes, userRes, analyticsRes] = await Promise.all([
                axios.get('/api/order/seller'),
                axios.get('/api/category/list'),
                axios.get('/api/seller/users-count'),
                axios.get('/api/seller/analytics')
            ])

            if (ordersRes.data.success) {
                const orders = ordersRes.data.orders || []
                const categories = categoryRes.data.success ? categoryRes.data.categories || [] : []
                const totalCustomers = userRes.data.success ? userRes.data.count : 0

                const paidOrders = orders.filter((o) => o.isPaid)
                const unpaidOrders = orders.filter((o) => !o.isPaid)

                setStats({
                    totalOrders: orders.length,
                    totalRevenue: paidOrders.reduce((sum, order) => sum + order.amount, 0),
                    pendingRevenue: unpaidOrders.reduce((sum, order) => sum + order.amount, 0),
                    paidOrders: paidOrders.length,
                    totalCustomers,
                    totalProducts: products.length,
                    totalCategories: categories.length,
                    recentOrders: orders.slice(0, 5)
                })
            }

            if (analyticsRes.data.success) {
                setAnalytics({
                    dailyStats: analyticsRes.data.dailyStats || [],
                    topSellingProducts: analyticsRes.data.topSellingProducts || [],
                    lowStockProducts: analyticsRes.data.lowStockProducts || [],
                    monthlyStats: analyticsRes.data.monthlyStats || []
                })
            }

        } catch (error) {
            toast.error("Failed to fetch dashboard data")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyData = analytics.monthlyStats.map(item => ({
        name: monthNames[item._id - 1],
        revenue: item.revenue
    }));

    const StatCard = ({ icon: Icon, label, value, bg, color, sub }) => (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={24} className={color} />
                </div>
            </div>
        </div>
    )

    const handleExport = async (type, format) => {
        try {
            toast.loading(`Preparing ${format.toUpperCase()}...`);
            const response = await axios.get(`/api/seller/export/${type}/${format}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success("Ready for Download!");
        } catch (error) {
            toast.dismiss();
            toast.error("Export failed. Please try again.");
            console.error(error);
        }
    }

    const [showLowStockModal, setShowLowStockModal] = useState(false);

    return (
        <div className='no-scrollbar flex-1 h-screen overflow-y-scroll bg-gray-50/30'>
            <div className="md:p-8 p-4 space-y-8 max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500">Real-time insights into your store's performance.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleExport('full', 'pdf')}
                            className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <MdFileDownload /> PDF Report
                        </button>
                        <button
                            onClick={() => handleExport('full', 'excel')}
                            className="bg-green-700 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition flex items-center gap-2"
                        >
                            <MdFileDownload /> Excel Report
                        </button>
                        <button
                            onClick={fetchDashboardData}
                            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={MdAttachMoney}
                        label="Total Revenue"
                        value={`${currency}${stats.totalRevenue.toLocaleString()}`}
                        bg="bg-green-100"
                        color="text-green-600"
                        sub="Total processed payments"
                    />
                    <StatCard
                        icon={MdShoppingCart}
                        label="Total Orders"
                        value={stats.totalOrders}
                        bg="bg-blue-100"
                        color="text-blue-600"
                        sub={`${stats.paidOrders} orders paid`}
                    />
                    <StatCard
                        icon={MdPeople}
                        label="Total Customers"
                        value={stats.totalCustomers}
                        bg="bg-purple-100"
                        color="text-purple-600"
                        sub="Registered users"
                    />
                    <StatCard
                        icon={MdWarning}
                        label="Low Stock Items"
                        value={analytics.lowStockProducts.length}
                        bg="bg-orange-100"
                        color="text-orange-600"
                        sub="Stock under 5 units"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <MdShowChart className="text-green-600" /> Revenue Trend (Last 30 Days)
                            </h3>
                        </div>
                        <div className="h-[300px] min-h-[300px] w-full">
                            {analytics.dailyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.dailyStats}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${currency}${value}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-50/50 rounded-lg text-gray-400 text-sm italic">
                                    No revenue data available for the last 30 days
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <MdTrendingUp className="text-blue-600" /> Monthly Performance
                            </h3>
                        </div>
                        <div className="h-[300px] min-h-[300px] w-full">
                            {formattedMonthlyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={formattedMonthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${currency}${value}`, 'Sales']}
                                        />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-50/50 rounded-lg text-gray-400 text-sm italic">
                                    No performance data available for this year
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Selling Products */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-bold text-gray-800">Top Selling Products</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Units Sold</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {analytics.topSellingProducts.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                    <span className="font-medium text-gray-900 text-sm max-w-[200px] truncate">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    Best Seller
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-gray-900">{item.totalSold}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">Inventory Alerts</h3>
                                <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-lg font-bold">Stock Warning</span>
                            </div>
                            {analytics.lowStockProducts.length > 0 && (
                                <button
                                    onClick={() => setShowLowStockModal(true)}
                                    className="text-[11px] font-bold text-green-600 hover:underline transition cursor-pointer"
                                >
                                    View All ({analytics.lowStockProducts.length})
                                </button>
                            )}
                        </div>
                        <div className="p-4 space-y-4 flex-1">
                            {analytics.lowStockProducts.length > 0 ? analytics.lowStockProducts.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-orange-50 hover:border-orange-200 transition bg-orange-50/30">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image[0]} alt="" className="w-10 h-10 rounded object-cover" />
                                        <p className="text-sm font-medium text-gray-800 max-w-[140px] truncate">{item.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-bold ${item.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>{item.stock === 0 ? 'Out of stock' : `${item.stock} left`}</p>
                                        <button onClick={() => navigate(`/seller/edit-product/${item._id}`)} className="text-[10px] text-blue-600 hover:underline cursor-pointer">Restock</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                                    <MdInventory2 size={40} className="mb-2 text-gray-300" />
                                    <p className="text-sm text-gray-500 font-medium">All items well stocked</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Low Stock Full List Modal */}
                {showLowStockModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div onClick={() => setShowLowStockModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <MdWarning className="text-orange-500" /> Complete Inventory Alerts
                                </h2>
                                <button
                                    onClick={() => setShowLowStockModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-3">
                                {analytics.lowStockProducts.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition group">
                                        <div className="flex items-center gap-4">
                                            <img src={item.image[0]} alt="" className="w-14 h-14 rounded-lg object-cover shadow-sm bg-gray-100" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">Product ID: {item._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                                    {item.stock === 0 ? '0 Stock' : `${item.stock} Units left`}
                                                </p>
                                                <p className="text-[10px] text-gray-400">Inventory Status</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigate(`/seller/edit-product/${item._id}`);
                                                    setShowLowStockModal(false);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                                            >
                                                RESTOCK
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

                {/* Recent Orders Bottom Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                        <button
                            onClick={() => navigate('/seller/orders')}
                            className="text-sm text-green-600 font-medium hover:underline cursor-pointer"
                        >
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-6 py-4">Order Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentOrders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {order.items.slice(0, 2).map(i => i.product.name).join(', ')}
                                                    {order.items.length > 2 && "..."}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    #{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900">{currency}{order.amount}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard
