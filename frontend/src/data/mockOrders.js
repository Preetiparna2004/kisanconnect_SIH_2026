export const mockOrders = [
  {
    id: 1001,
    buyer_id: 10,
    status: 'DELIVERED',
    total_amount: 3100,
    delivery_address: '45 MG Road, Bhubaneswar, Odisha 751001',
    created_at: '2026-08-01T10:30:00Z',
    updated_at: '2026-08-05T18:00:00Z',
    items: [
      { id: 1, crop_id: 1, quantity_kg: 50, price_per_kg: 62, subtotal: 3100,
        crop: { id: 1, name: 'Basmati Rice', category: 'CEREALS' } },
    ],
  },
  {
    id: 1002,
    buyer_id: 10,
    status: 'SHIPPED',
    total_amount: 1680,
    delivery_address: '12 Connaught Place, New Delhi 110001',
    created_at: '2026-08-28T09:00:00Z',
    updated_at: '2026-08-30T14:00:00Z',
    items: [
      { id: 2, crop_id: 4, quantity_kg: 14, price_per_kg: 120, subtotal: 1680,
        crop: { id: 4, name: 'Royal Delicious Apple', category: 'FRUITS' } },
    ],
  },
  {
    id: 1003,
    buyer_id: 10,
    status: 'PLACED',
    total_amount: 2800,
    delivery_address: '88 Park Street, Kolkata 700016',
    created_at: '2026-09-04T16:00:00Z',
    updated_at: '2026-09-04T16:00:00Z',
    items: [
      { id: 3, crop_id: 5, quantity_kg: 10, price_per_kg: 280, subtotal: 2800,
        crop: { id: 5, name: 'Rajasthani Cumin', category: 'SPICES' } },
    ],
  },
]
