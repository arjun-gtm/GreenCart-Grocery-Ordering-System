import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { MdEdit, MdDelete } from 'react-icons/md'

const CategoryList = () => {
    const { axios } = useAppContext()
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch categories directly from API
    const fetchCategories = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/category/list')
            if (data.success) {
                setCategories(data.categories)
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
        fetchCategories()
    }, [])

    const handleEdit = (categoryId) => {
        navigate(`/seller/edit-category/${categoryId}`)
    }

    const handleDeleteClick = (categoryId) => {
        setDeleteConfirm(categoryId)
    }

    const confirmDelete = async (categoryId) => {
        try {
            const { data } = await axios.delete(`/api/category/${categoryId}`)
            if (data.success) {
                await fetchCategories()
                toast.success(data.message)
                setDeleteConfirm(null)
            } else {
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
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col">
            <div className="w-full md:p-10 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and export your store's category structure.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                try {
                                    toast.loading("Preparing Category Report...");
                                    const response = await axios.get('/api/seller/export/categories/excel', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'categories_report.xlsx');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    toast.dismiss();
                                    toast.success("Category Report Downloaded");
                                } catch (e) { toast.dismiss(); toast.error("Export failed"); }
                            }}
                            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                        >
                            Export (Excel)
                        </button>
                        <button
                            onClick={() => navigate('/seller/add-category')}
                            className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition cursor-pointer"
                        >
                            + Add Category
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-600">Loading categories...</div>
                ) : categories.length > 0 ? (
                    <div className="overflow-hidden rounded-lg bg-white border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Image</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Path</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Color</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded overflow-hidden border border-gray-200">
                                                    <img
                                                        src={category.image}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{category.path}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded border border-gray-300"
                                                        style={{ backgroundColor: category.bgColor }}
                                                    ></div>
                                                    <span className="text-xs text-gray-600">{category.bgColor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(category._id)}
                                                        className="w-10 h-10 flex items-center justify-center text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition duration-200 cursor-pointer"
                                                        title="Edit Category"
                                                    >
                                                        <MdEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(category._id)}
                                                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition duration-200 cursor-pointer"
                                                        title="Delete Category"
                                                    >
                                                        <MdDelete size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                        <div className="text-center">
                            <p className="text-gray-600 text-lg mb-4">No categories found</p>
                            <button
                                onClick={() => navigate('/seller/add-category')}
                                className="px-6 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition cursor-pointer"
                            >
                                Create First Category
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
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

export default CategoryList
