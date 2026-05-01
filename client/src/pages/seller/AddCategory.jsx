import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'

const AddCategory = () => {
    const [name, setName] = useState('')
    const [path, setPath] = useState('')
    const [bgColor, setBgColor] = useState('#1a472a')
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    const { axios } = useAppContext()
    const { categoryId } = useParams()
    const navigate = useNavigate()

    // Load category data if editing - fetch directly from API
    useEffect(() => {
        if (categoryId) {
            setIsEditing(true)
            fetchCategoryData()
        }
    }, [categoryId])

    const fetchCategoryData = async () => {
        try {
            const { data } = await axios.get(`/api/category/list`)
            if (data.success && data.categories) {
                const category = data.categories.find(c => c._id === categoryId)
                if (category) {
                    setName(category.name || '')
                    setPath(category.path || '')
                    setBgColor(category.bgColor || '#1a472a')
                    setImagePreview(category.image || '')
                    // Don't set image, keep null to show existing
                } else {
                    toast.error('Category not found')
                    navigate('/seller/category-list')
                }
            }
        } catch (error) {
            toast.error('Failed to load category')
            navigate('/seller/category-list')
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            const preview = URL.createObjectURL(file)
            setImagePreview(preview)
        }
    }

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault()
            setLoading(true)

            if (!name || !path || !bgColor) {
                toast.error("Name, Path, and Color are required")
                return
            }

            if (!isEditing && !image) {
                toast.error("Image is required for new categories")
                return
            }

            const formData = new FormData()
            formData.append('name', name)
            formData.append('path', path.toLowerCase())
            formData.append('bgColor', bgColor)
            if (image) {
                formData.append('image', image)
            }

            let response
            if (isEditing) {
                response = await axios.put(`/api/category/${categoryId}`, formData)
            } else {
                response = await axios.post('/api/category/add', formData)
            }

            const { data } = response

            if (data.success) {
                toast.success(data.message)
                // Always navigate to list after add or edit
                navigate('/seller/category-list')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
            <div className="w-full md:p-10 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    {isEditing ? 'Edit Category' : 'Add New Category'}
                </h2>

                <form onSubmit={onSubmitHandler} className="max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
                    {/* Category Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="category-name">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            id="category-name"
                            type="text"
                            placeholder="e.g., Fresh Vegetables"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Category Path */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="category-path">
                            Category Path <span className="text-red-500">*</span>
                        </label>
                        <input
                            onChange={(e) => setPath(e.target.value)}
                            value={path}
                            id="category-path"
                            type="text"
                            placeholder="e.g., vegetables"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <p className="text-xs text-gray-500">Used for URL routing (will be lowercase)</p>
                    </div>

                    {/* Background Color */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="category-color">
                            Background Color <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4 flex-wrap">
                            <input
                                onChange={(e) => setBgColor(e.target.value)}
                                value={bgColor}
                                id="category-color"
                                type="color"
                                className="w-20 h-10 rounded-lg cursor-pointer border border-gray-300"
                                required
                            />
                            <input
                                onChange={(e) => setBgColor(e.target.value)}
                                value={bgColor}
                                type="text"
                                placeholder="#1a472a"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                maxLength="7"
                            />
                            <div
                                className="w-20 h-10 rounded-lg border-2 border-gray-300"
                                style={{ backgroundColor: bgColor }}
                            ></div>
                        </div>
                    </div>

                    {/* Category Image */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Category Image {!isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <label htmlFor="category-image" className="cursor-pointer block">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-50 transition text-center">
                                {imagePreview ? (
                                    <div className="flex flex-col items-center">
                                        <img src={imagePreview} alt="preview" className="max-h-40 mb-3 rounded" />
                                        <p className="text-xs text-gray-600">Click to {isEditing ? 'change' : 'upload'} image</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <p className="text-4xl mb-2">📸</p>
                                        <p className="text-gray-600">Click to upload image</p>
                                    </div>
                                )}
                            </div>
                            <input
                                onChange={handleImageChange}
                                type="file"
                                id="category-image"
                                hidden
                                accept="image/*"
                            />
                        </label>
                        {isEditing && imagePreview && !image && (
                            <p className="text-xs text-gray-500 mt-2">Leave empty to keep current image</p>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Loading...' : isEditing ? 'Update Category' : 'Add Category'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/seller/category-list')}
                            className="px-6 py-2.5 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddCategory
