import React, { useState, useEffect } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const AddProduct = () => {

    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [stock, setStock] = useState(0);
    const [existingImages, setExistingImages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const {axios, products, fetchProducts} = useAppContext()
    const { productId } = useParams();
    const navigate = useNavigate();

    // Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/category/list');
            if (data.success && data.categories) {
                setCategories(data.categories);
            } else {
                toast.error('Failed to load categories');
            }
        } catch (error) {
            toast.error('Error fetching categories');
        } finally {
            setLoading(false);
        }
    }

    // Load product data if editing
    useEffect(() => {
        if (productId) {
            setIsEditing(true);
            const product = products.find(p => p._id === productId);
            if (product) {
                setName(product.name);
                setDescription(product.description.join('\n'));
                setCategory(product.category);
                setPrice(product.price);
                setOfferPrice(product.offerPrice);
                setStock(product.stock || 0);
                setExistingImages(product.image);
            }
        }
    }, [productId, products]);

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            const productData = {
                name,
                description: description.split('\n'),
                category,
                price,
                offerPrice,
                stock: Number(stock)
            }

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            
            // Only append new files if they exist
            for (let i = 0; i < files.length; i++) {
                if (files[i]) {
                    formData.append('images', files[i])
                }
            }

            let response;
            if (isEditing) {
                response = await axios.put(`/api/product/${productId}`, formData)
            } else {
                response = await axios.post('/api/product/add', formData)
            }

            const {data} = response

            if (data.success){
                toast.success(data.message);
                setName('');
                setDescription('')
                setCategory('')
                setPrice('')
                setOfferPrice('')
                setStock(0)
                setFiles([])
                setExistingImages([])
                await fetchProducts();
                if (isEditing) {
                    navigate('/seller/product-list');
                }
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
        
      }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <h2 className="text-lg font-medium">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
                <div>
                    <p className="text-base font-medium">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>

                                <input onChange={(e)=>{
                                    const updatedFiles = [...files];
                                    updatedFiles[index] = e.target.files[0]
                                    setFiles(updatedFiles)
                                }}
                                type="file" id={`image${index}`} hidden />

                                <img 
                                    className="max-w-24 cursor-pointer" 
                                    src={files[index] ? URL.createObjectURL(files[index]) : (existingImages[index] || assets.upload_area)} 
                                    alt="uploadArea" 
                                    width={100} 
                                    height={100} 
                                />
                            </label>
                        ))}
                    </div>
                    {isEditing && existingImages.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">Upload new images to replace existing ones</p>
                    )}
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                    <input onChange={(e)=> setName(e.target.value)} value={name}
                     id="product-name" type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
                    <textarea onChange={(e)=> setDescription(e.target.value)} value={description}
                     id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                </div>
                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Category</label>
                    <select onChange={(e)=> setCategory(e.target.value)} value={category} 
                    id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" disabled={loading}>
                        <option value="">{loading ? 'Loading categories...' : 'Select Category'}</option>
                        {categories.map((item, index)=>(
                            <option key={index} value={item.name}>{item.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
                        <input onChange={(e)=> setPrice(e.target.value)} value={price}
                         id="product-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                        <input onChange={(e)=> setOfferPrice(e.target.value)} value={offerPrice} 
                        id="offer-price" type="number" placeholder="0" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-stock">Stock Quantity</label>
                    <input onChange={(e)=> setStock(e.target.value)} value={stock}
                     id="product-stock" type="number" placeholder="Enter stock amount" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex items-center gap-3">
                    <button type="submit" className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer">
                        {isEditing ? 'UPDATE' : 'ADD'}
                    </button>
                    {isEditing && (
                        <button 
                            type="button"
                            onClick={() => navigate('/seller/product-list')}
                            className="px-8 py-2.5 bg-gray-400 text-white font-medium rounded cursor-pointer hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
  )
}

export default AddProduct
