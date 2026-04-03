import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const {navigate, setSearchQuery, searchQuery, getCartCount, isSignedIn} = useAppContext();

    useEffect(()=>{
      if(searchQuery.length > 0){
        navigate("/products")
      }
    },[searchQuery])

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">

      <NavLink to='/' onClick={()=> setOpen(false)}>
        <img className="h-9" src={assets.logo} alt="logo" />
      </NavLink>

      <div className="hidden sm:flex items-center gap-8">
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/products'>All Product</NavLink>
        <NavLink to='/contact'>Contact</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
         <img src={assets.search_icon} alt='search' className='w-4 h-4'/>
        </div>

        <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>

        <Show when="signed-out">
            <div className='flex items-center gap-4'>
                <SignInButton mode='modal'>
                    <button className="cursor-pointer px-6 py-2 bg-gray-100 hover:bg-gray-200 transition text-gray-800 rounded-full text-sm">
                        Sign In
                    </button>
                </SignInButton>
                <SignUpButton mode='modal'>
                    <button className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
                        Sign Up
                    </button>
                </SignUpButton>
            </div>
        </Show>

        <Show when="signed-in">
            <div className='flex items-center gap-4'>
                <NavLink to='/my-orders' className='text-sm'>My Orders</NavLink>
                <UserButton />
            </div>
        </Show>
      </div>

<div className='flex items-center gap-6 sm:hidden'>
      <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>
    <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="">
        <img  src={assets.menu_icon} alt='menu'/>
      </button>
</div>
      

      { open && (
        <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-50`}>
        <NavLink to="/" onClick={()=> setOpen(false)}>Home</NavLink>
        <NavLink to="/products" onClick={()=> setOpen(false)}>All Product</NavLink>
        
        <Show when="signed-in">
            <NavLink to="/my-orders" onClick={()=> setOpen(false)}>My Orders</NavLink>
        </Show>

        <NavLink to="/contact" onClick={()=> setOpen(false)}>Contact</NavLink>

        <Show when="signed-out">
            <SignInButton mode='modal'>
                <button className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
                    Login
                </button>
            </SignInButton>
        </Show>

        <Show when="signed-in">
           <div className='mt-2'>
             <UserButton />
           </div>
        </Show>
        
      </div>
      )}

    </nav>
  )
}

export default Navbar
