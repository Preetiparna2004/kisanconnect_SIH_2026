import React from 'react'
import { Check } from 'lucide-react'

const STEPS = [
  { key: 'PLACED',    label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PACKED',    label: 'Packed' },
  { key: 'SHIPPED',   label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
]

export default function OrderStatusStepper({ status }) {
  const currentIdx = STEPS.findIndex((s) => s.key === status)
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-100">
        <span className="badge badge-red text-sm px-3 py-1">Order Cancelled</span>
      </div>
    )
  }

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {STEPS.map((step, idx) => {
          const isDone    = idx < currentIdx
          const isActive  = idx === currentIdx
          const isPending = idx > currentIdx

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isDone    ? 'step-done'    : ''}
                  ${isActive  ? 'step-active ring-4 ring-green-100' : ''}
                  ${isPending ? 'step-pending' : ''}
                `}>
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`mt-1.5 text-[11px] font-medium text-center leading-tight max-w-[56px]
                  ${isActive ? 'text-green-700' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 min-w-[40px] transition-all duration-300
                  ${idx < currentIdx ? 'bg-green-600' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
