import React, { useState } from 'react'
import { Leaf } from 'lucide-react'

export default function CropImage({ src, alt, className = '', fallbackClassName = '' }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-green-50 ${className} ${fallbackClassName}`} role="img" aria-label={alt}>
        <Leaf className="w-16 h-16 text-green-200" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
