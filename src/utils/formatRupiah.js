export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number)
}

// Function untuk mendapatkan image URL yang valid
export const getImageUrl = (imageUrl, productName = '') => {
  if (imageUrl && imageUrl !== '' && imageUrl !== 'null' && imageUrl !== 'undefined') {
    return imageUrl
  }
  
  // Fallback berdasarkan nama produk untuk gambar yang lebih relevan
  const name = productName?.toLowerCase() || ''
  
  if (name.includes('samsung') || name.includes('hp') || name.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1592899677977-9e10cb588d6a?w=400'
  }
  if (name.includes('headphone') || name.includes('earphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
  }
  if (name.includes('watch') || name.includes('jam')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
  }
  if (name.includes('kamera') || name.includes('camera')) {
    return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
  }
  if (name.includes('sepeda') || name.includes('bike')) {
    return 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'
  }
  if (name.includes('tas') || name.includes('bag')) {
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
  }
  if (name.includes('baju') || name.includes('fashion') || name.includes('shirt')) {
    return 'https://images.unsplash.com/photo-1617137968427-85924c8006f8?w=400'
  }
  if (name.includes('makanan') || name.includes('food')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
  }
  
  // Default fallback
  return `https://placehold.co/400x400?text=${encodeURIComponent(productName || 'LocalMart')}&bg=FF6B35&textColor=white`
}

export const getProductName = (product = {}) => {
  return product?.name || product?.product_name || 'Produk LocalMart'
}

export const getCategoryName = (product = {}) => {
  return product?.category_name || product?.category || 'Umum'
}

export const getStoreName = (product = {}) => {
  return product?.store_name || product?.seller_name || product?.store || 'Toko LocalMart'
}

export const getApiData = (response, fallback = null) => {
  if (!response) return fallback
  if (Array.isArray(response)) return response
  if (response.data?.data) return response.data.data
  if (response.data) return response.data
  if (response.result) return response.result
  if (response.products) return response.products
  if (response.categories) return response.categories
  return fallback
}