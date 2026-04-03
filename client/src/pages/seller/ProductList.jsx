import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { MdEdit, MdDelete } from 'react-icons/md'

const ProductList = () => {
    const {products, currency, axios, fetchProducts} = useAppContext()
    const navigate = useNavigate()
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const toggleStock = async (id, inStock)=>{
        try {
            const { data } = await axios.post('/api/product/stock', {id, inStock});
            if (data.success){
                fetchProducts();
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleEdit = (productId) => {
        navigate(`/seller/edit-product/${productId}`)
    }

    const handleDeleteClick = (productId) => {
        setDeleteConfirm(productId)
    }

    const confirmDelete = async (productId) => {
        try {
            const { data } = await axios.delete(`/api/product/${productId}`);
            if (data.success){
                fetchProducts();
                toast.success(data.message)
                setDeleteConfirm(null)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelDelete = () => {
        setDeleteConfirm(null)
    }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">All Products</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and track your store inventory here.</p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                toast.loading("Preparing Inventory Report...");
                                const response = await axios.get('/api/seller/export/products/excel', { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'inventory_report.xlsx');
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                toast.dismiss();
                                toast.success("Inventory Report Downloaded");
                            } catch (e) { toast.dismiss(); toast.error("Export failed"); }
                        }}
                        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                        Export Inventory (Excel)
                    </button>
                </div>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Product</th>
                                <th className="px-4 py-3 font-semibold truncate">Category</th>
                                <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                                <th className="px-4 py-3 font-semibold truncate text-center">Stock</th>
                                <th className="px-4 py-3 font-semibold truncate text-center">In Stock</th>
                                <th className="px-4 py-3 font-semibold truncate text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {products.map((product) => (
                                <tr key={product._id} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <div className="border border-gray-300 rounded p-2">
                                            <img src={product.image[0]} alt="Product" className="w-16" />
                                        </div>
                                        <span className="truncate max-sm:hidden w-full">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{product.category}</td>
                                    <td className="px-4 py-3 max-sm:hidden">{currency}{product.offerPrice}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-medium ${product.stock < 5 ? 'text-red-500' : 'text-gray-900'}`}>
                                            {product.stock || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center">
                                            <label 
                                                className={`relative inline-flex items-center ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-gray-900`}
                                                title={product.stock <= 0 ? "Cannot mark in-stock without inventory" : ""}
                                            >
                                                <input 
                                                    onChange={()=> {
                                                        if(product.stock > 0) toggleStock(product._id, !product.inStock)
                                                        else toast.error("Update stock before marking in-stock!")
                                                    }} 
                                                    checked={product.stock > 0 && product.inStock} 
                                                    disabled={product.stock <= 0}
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                                                <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => handleEdit(product._id)}
                                                className="w-10 h-10 flex items-center justify-center text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition duration-200 shadow-sm cursor-pointer"
                                                title="Edit Product"
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(product._id)}
                                                className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition duration-200 shadow-sm cursor-pointer"
                                                title="Delete Product"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
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

export default ProductList
