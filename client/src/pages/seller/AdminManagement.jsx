import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdPerson, MdEmail, MdLock, MdClose } from 'react-icons/md'

const AdminManagement = () => {
    const { axios } = useAppContext()
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editAdmin, setEditAdmin] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })

    const fetchAdmins = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/seller/admin')
            if (data.success) {
                setAdmins(data.admins)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Failed to fetch admins")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditAdmin(admin)
            setFormData({ name: admin.name, email: admin.email, password: '' })
        } else {
            setEditAdmin(null)
            setFormData({ name: '', email: '', password: '' })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let res;
            if (editAdmin) {
                res = await axios.put(`/api/seller/admin/${editAdmin._id}`, formData)
            } else {
                res = await axios.post('/api/seller/admin', formData)
            }

            if (res.data.success) {
                toast.success(res.data.message)
                setShowModal(false)
                fetchAdmins()
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;
        try {
            const { data } = await axios.delete(`/api/seller/admin/${id}`)
            if (data.success) {
                toast.success(data.message)
                fetchAdmins()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='no-scrollbar flex-1 h-screen overflow-y-scroll bg-gray-50/30'>
            <div className="md:p-8 p-4 space-y-8 max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                        <p className="text-gray-500">Manage system administrators and their access.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition shadow-sm"
                    >
                        <MdAdd size={20} /> Add New Admin
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">Loading admins...</td>
                                </tr>
                            ) : admins.length > 0 ? admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {admin.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{admin.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${admin.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(admin)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <MdEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(admin._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">No admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">{editAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400">
                                <MdClose size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                        placeholder="admin@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={editAdmin ? 'text' : 'password'}
                                        required={!editAdmin}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                        placeholder={editAdmin ? "Leave blank to keep current" : "••••••••"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                {editAdmin && <p className="text-[10px] text-gray-400 mt-1 italic">Only fill if you want to change the password.</p>}
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20"
                                >
                                    {editAdmin ? 'Update Admin' : 'Create Admin Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminManagement
