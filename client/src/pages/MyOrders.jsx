import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { MdShoppingCart } from 'react-icons/md'

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { currency, axios, user, navigate, isLoaded } = useAppContext()

    const fetchMyOrders = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/order/user')
            if (data.success) {
                setMyOrders(data.orders || [])
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
        if (isLoaded) {
            if (user) {
                fetchMyOrders()
            } else {
                setMyOrders([])
                setLoading(false)
            }
        }
    }, [user, isLoaded])

    const paymentTypeLabel = (order) => (order.paymentType === 'COD' ? 'COD' : 'Online')

    const statusMeta = (order) => {
        if (order.paymentType === 'COD') {
            return {
                label: 'Due on delivery',
                className: 'text-gray-500',
            }
        }
        if (order.isPaid) {
            return { label: 'Paid', className: 'text-emerald-600' }
        }
        return { label: 'Pending', className: 'text-amber-600' }
    }

    const shortOrderId = (id) => {
        if (!id) return '—'
        const s = String(id)
        return s.length > 10 ? `${s.slice(-8)}` : s
    }

    const fulfillmentLabel = (order) => order.status || 'Processing'

    const orderStatusStyle = (status) => {
        const s = (status || 'Processing').toLowerCase()
        if (s === 'delivered') return 'bg-emerald-50 text-emerald-700'
        if (s === 'canceled' || s === 'cancelled') return 'bg-rose-50 text-rose-700'
        if (s === 'out for delivery') return 'bg-sky-50 text-sky-700'
        if (s === 'processing') return 'bg-primary/10 text-primary'
        return 'bg-neutral-100 text-neutral-600'
    }

    return (
        <div className="mt-8 md:mt-12 pb-14 max-w-2xl mx-auto w-full text-sm">
            <header className="mb-6 md:mb-8">
                <h1 className="text-xl font-semibold text-neutral-900 tracking-tight text-gray-700 font-medium">Orders</h1>
                <p className="mt-1 text-sm text-neutral-400">Status, payment, and items in one place.</p>
            </header>

            {loading ? (
                <p className="py-12 text-center text-sm text-neutral-400">Loading…</p>
            ) : myOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100">
                        <MdShoppingCart className="text-neutral-300" size={22} />
                    </div>
                    <p className="text-sm font-medium text-neutral-800">No orders yet</p>
                    <p className="mt-1 text-sm text-neutral-500">Your purchases will appear here.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="mt-6 text-sm font-medium text-primary hover:text-primary-dull transition cursor-pointer"
                    >
                        Browse products →
                    </button>
                </div>
            ) : (
                <ul className="flex flex-col gap-4 list-none p-0 m-0">
                    {myOrders.map((order) => {
                        const stat = statusMeta(order)
                        const typeLabel = paymentTypeLabel(order)
                        const fulfillment = fulfillmentLabel(order)
                        const formattedTotal =
                            typeof order.amount === 'number'
                                ? order.amount.toLocaleString()
                                : order.amount

                        return (
                            <li
                                key={order._id}
                                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
                            >
                                <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-b border-neutral-100">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                        <span className="font-medium text-neutral-900 tabular-nums">
                                            #{shortOrderId(order._id)}
                                        </span>
                                        <span className="text-neutral-300">·</span>
                                        <time className="text-neutral-400 tabular-nums text-xs">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString()
                                                : ''}
                                        </time>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                        <span className="tabular-nums">
                                            <span className="text-neutral-400">Total </span>
                                            <span className="font-semibold text-neutral-900">
                                                {currency}
                                                {formattedTotal}
                                            </span>
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusStyle(fulfillment)}`}
                                        >
                                            {fulfillment}
                                        </span>
                                        <span className="text-neutral-300 hidden sm:inline">·</span>
                                        <span className="text-xs text-neutral-500">{typeLabel}</span>
                                        <span className={`text-xs font-medium ${stat.className}`}>
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[260px] text-xs">
                                        <thead>
                                            <tr className="text-left text-[11px] font-normal text-neutral-400">
                                                <th className="w-11 py-2 pl-4 pr-0 font-normal sm:w-12" />
                                                <th className="px-2 py-2 font-normal">Item</th>
                                                <th className="w-10 px-1 py-2 text-center font-normal">Qty</th>
                                                <th className="w-[4.25rem] py-2 pl-1 pr-4 text-right font-normal whitespace-nowrap">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((item, idx) => {
                                                const line =
                                                    item.product?.offerPrice != null
                                                        ? item.product.offerPrice * (item.quantity || 1)
                                                        : null
                                                const imgSrc = item.product?.image?.[0]
                                                const isLast = idx === (order.items?.length ?? 0) - 1
                                                return (
                                                    <tr
                                                        key={`${order._id}-${idx}`}
                                                        className={`${!isLast ? 'border-b border-neutral-50' : ''}`}
                                                    >
                                                        <td className="py-2 pl-4 pr-0 align-middle text-gray-500">
                                                            <div className="h-9 w-9 overflow-hidden rounded-lg bg-neutral-100 sm:h-10 sm:w-10">
                                                                {imgSrc ? (
                                                                    <img
                                                                        src={imgSrc}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                        <td className="max-w-[1px] px-2 py-2 align-middle">
                                                            <p className="truncate font-medium text-neutral-800">
                                                                {item.product?.name ?? 'Product'}
                                                            </p>
                                                            {item.product?.category ? (
                                                                <p className="truncate text-[11px] text-neutral-400 mt-0.5">
                                                                    {item.product.category}
                                                                </p>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-1 py-2 align-middle text-center text-neutral-600 tabular-nums">
                                                            {item.quantity ?? 1}
                                                        </td>
                                                        <td className="py-2 pl-1 pr-4 align-middle text-right font-medium tabular-nums text-neutral-900 whitespace-nowrap">
                                                            {line != null
                                                                ? `${currency}${line.toLocaleString()}`
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default MyOrders
