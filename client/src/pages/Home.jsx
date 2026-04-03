import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import { useAppContext } from '../context/AppContext'

const Home = () => {
  const { categories, categoriesLoading } = useAppContext();

  return (
    <div className='mt-10'>
      <MainBanner />
      <Categories />
      {/* debug info, visible if list empty */}
      {!categoriesLoading && categories.length === 0 && (
        <p className='text-center text-red-500 mt-8'>No categories found. Please add some via the seller panel.</p>
      )}
      <BestSeller />
      <BottomBanner/>
      <NewsLetter />
    </div>
  )
}

export default Home
