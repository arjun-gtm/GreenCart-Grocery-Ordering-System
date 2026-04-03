import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { MdShoppingCart, MdDelete } from 'react-icons/md'

/** Must match server `ORDER_STATUSES` in orderController.js */
const ORDER_STATUSES = [
    'Processing',
    'Out for delivery',
    'Delivered',
    'Cancelled',
]

const Orders = () => {
    const { currency, axios } = useAppContext()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [statusUpdatingId, setStatusUpdatingId] = useState(null)
    const [paymentUpdatingId, setPaymentUpdatingId] = useState(null)

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/order/seller')
            if (data.success) {
                setOrders(data.orders || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const formatAddress = (addr) => {
        if (!addr || typeof addr !== 'object') return { lines: [], phone: '', email: '' }
        const lines = [
            [addr.street, addr.city].filter(Boolean).join(', '),
            [addr.state, addr.zipcode, addr.country].filter(Boolean).join(', '),
        ].filter((line) => line.length > 0)
        return {
            lines,
            phone: addr.phone || '',
            email: addr.email || '',
        }
    }

    /** Display payment type exactly as COD or Online (matches DB). */
    const paymentTypeLabel = (order) => (order.paymentType === 'COD' ? 'COD' : 'Online')

    const statusMeta = (order) => {
        if (order.paymentType === 'COD') {
            return {
                label: 'Due on delivery',
                className: 'bg-slate-100 text-slate-700',
            }
        }
        if (order.isPaid) {
            return { label: 'Paid', className: 'bg-green-100 text-green-800' }
        }
        return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' }
    }

    const confirmDelete = async (orderId) => {
        try {
            const { data } = await axios.delete(`/api/order/${orderId}`)
            if (data.success) {
                toast.success(data.message)
                setDeleteConfirm(null)
                setOrders((prev) => prev.filter((o) => o._id !== orderId))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelDelete = () => setDeleteConfirm(null)

    const handleStatusChange = async (orderId, newStatus) => {
        setStatusUpdatingId(orderId)
        try {
            const { data } = await axios.patch(`/api/order/${orderId}/status`, { status: newStatus })
            if (data.success) {
                toast.success(data.message)
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
                )
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setStatusUpdatingId(null)
        }
    }

    const handlePaymentToggle = async (orderId, currentIsPaid) => {
        setPaymentUpdatingId(orderId)
        try {
            const { data } = await axios.patch(`/api/order/${orderId}/payment`, { isPaid: !currentIsPaid })
            if (data.success) {
                toast.success(data.message)
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, isPaid: !currentIsPaid } : o))
                )
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setPaymentUpdatingId(null)
        }
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col">
            <div className="w-full md:p-10 p-4">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Orders</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Review and track shipments for all customers.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                try {
                                    toast.loading("Preparing PDF...");
                                    const response = await axios.get('/api/seller/export/orders/pdf', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'orders_report.pdf');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    toast.dismiss();
                                    toast.success("PDF Downloaded");
                                } catch (e) { toast.dismiss(); toast.error("Export failed"); }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                        >
                            Export PDF
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    toast.loading("Preparing Excel...");
                                    const response = await axios.get('/api/seller/export/orders/excel', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'orders_report.xlsx');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    toast.dismiss();
                                    toast.success("Excel Downloaded");
                                } catch (e) { toast.dismiss(); toast.error("Export failed"); }
                            }}
                            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                        >
                            Export Excel
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-600">Loading orders...</div>
                ) : orders.length > 0 ? (
                    <div className="overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Items
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Delivery
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Payment
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Order status
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map((order) => {
                                        const addr = order.address
                                        const name =
                                            addr && typeof addr === 'object'
                                                ? `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
                                                : ''
                                        const { lines: addressLines, phone, email } = formatAddress(addr)
                                        const stat = statusMeta(order)
                                        const typeLabel = paymentTypeLabel(order)

                                        return (
                                            <tr
                                                key={order._id}
                                                className="hover:bg-gray-50 transition align-top"
                                            >
                                                <td className="px-6 py-4">
                                                    <ul className="text-sm text-gray-900 space-y-3 min-w-0">
                                                        {order.items?.map((item, idx) => {
                                                            const imgSrc = item.product?.image?.[0]
                                                            return (
                                                                <li
                                                                    key={idx}
                                                                    className="flex gap-3 items-center leading-snug"
                                                                >
                                                                    <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                                                                        {imgSrc ? (
                                                                            <img
                                                                                src={imgSrc}
                                                                                alt=""
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-gray-100" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="font-medium">
                                                                            {item.product?.name ?? 'Product'}
                                                                        </span>
                                                                        <span className="text-primary font-medium">
                                                                            {' '}
                                                                            × {item.quantity}
                                                                        </span>
                                                                    </div>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {name || '—'}
                                                    </p>
                                                    {email ? (
                                                        <p className="text-sm text-gray-600 mt-1 break-all">
                                                            {email}
                                                        </p>
                                                    ) : null}
                                                    {phone ? (
                                                        <p className="text-sm text-gray-600 mt-1">{phone}</p>
                                                    ) : null}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {addressLines.length > 0 ? (
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            {addressLines.map((line, i) => (
                                                                <p key={i}>{line}</p>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">—</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                                        {currency}
                                                        {typeof order.amount === 'number'
                                                            ? order.amount.toLocaleString()
                                                            : order.amount}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-2">
                                                        {/* Payment type badge */}
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                                            typeLabel === 'COD'
                                                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                typeLabel === 'COD' ? 'bg-indigo-500' : 'bg-cyan-500'
                                                            }`}></span>
                                                            {typeLabel}
                                                        </span>

                                                        {/* Payment status — clickable toggle for COD, static for Online */}
                                                        {order.paymentType === 'COD' ? (
                                                            <button
                                                                type="button"
                                                                disabled={paymentUpdatingId === order._id}
                                                                onClick={() => handlePaymentToggle(order._id, order.isPaid)}
                                                                title={order.isPaid ? 'Click to mark as Unpaid' : 'Click to mark as Paid'}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer disabled:opacity-50 ${
                                                                    order.isPaid
                                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                                                }`}
                                                            >
                                                                <span className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                                {paymentUpdatingId === order._id
                                                                    ? '...'
                                                                    : order.isPaid ? 'Paid' : 'Unpaid'}
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                Paid
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status || 'Processing'}
                                                        disabled={statusUpdatingId === order._id}
                                                        onChange={(e) =>
                                                            handleStatusChange(order._id, e.target.value)
                                                        }
                                                        className="min-w-[11rem] max-w-[14rem] text-sm border border-gray-200 rounded-lg bg-white px-3 py-2 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 cursor-pointer"
                                                    >
                                                        {order.status &&
                                                            !ORDER_STATUSES.includes(order.status) && (
                                                                <option value={order.status}>
                                                                    {order.status}
                                                                </option>
                                                            )}
                                                        {ORDER_STATUSES.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900 whitespace-nowrap">
                                                        {order.createdAt
                                                            ? new Date(order.createdAt).toLocaleString()
                                                            : '—'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteConfirm(order._id)}
                                                            className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition duration-200 cursor-pointer"
                                                            title="Delete order"
                                                        >
                                                            <MdDelete size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[16rem] bg-white rounded-lg border border-gray-200">
                        <div className="text-center px-4">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <MdShoppingCart className="text-gray-400" size={28} />
                            </div>
                            <p className="text-gray-600 text-lg mb-1">No orders yet</p>
                            <p className="text-gray-500 text-sm">
                                New orders will show up here once customers place them.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete order</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this order? This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orders
