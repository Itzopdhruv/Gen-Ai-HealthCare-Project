'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Plus, AlertCircle } from 'lucide-react'
import { Medicine } from '@/lib/database'

interface RestockModalProps {
  isOpen: boolean
  onClose: () => void
  medicine: Medicine | null
  onRestock: (medicineId: string, quantity: number, reason: string, notes?: string) => Promise<void>
  loading?: boolean
}

const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onRestock,
  loading = false
}) => {
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('restock')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!medicine) return

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid positive quantity')
      return
    }

    if (medicine.stock + qty > medicine.maxStock) {
      setError(`Adding ${qty} units will exceed maximum stock (${medicine.maxStock}). Current: ${medicine.stock}`)
      return
    }

    try {
      await onRestock(medicine.id, qty, reason, notes.trim() || undefined)
      handleClose()
    } catch (err) {
      setError('Failed to restock medicine. Please try again.')
    }
  }

  const handleClose = () => {
    setQuantity('')
    setReason('restock')
    setNotes('')
    setError('')
    onClose()
  }

  const getNewStock = () => {
    const qty = parseInt(quantity) || 0
    return medicine ? medicine.stock + qty : 0
  }

  const isNearMax = () => {
    if (!medicine) return false
    const newStock = getNewStock()
    return newStock >= medicine.maxStock * 0.9
  }

  if (!medicine) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Restock Medicine</h2>
                  <p className="text-sm text-gray-500">{medicine.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Current Stock Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Current Stock:</span>
                  <span className="text-lg font-bold text-gray-900">{medicine.stock} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Minimum Stock:</span>
                  <span className="text-sm text-gray-700">{medicine.minStock} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Maximum Stock:</span>
                  <span className="text-sm text-gray-700">{medicine.maxStock} units</span>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-field"
                  placeholder="Enter quantity"
                  min="1"
                  max={medicine.maxStock - medicine.stock}
                  required
                  disabled={loading}
                />
                {quantity && !isNaN(parseInt(quantity)) && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">New stock will be:</span>
                    <span className={`font-bold ${isNearMax() ? 'text-yellow-600' : 'text-green-600'}`}>
                      {getNewStock()} units
                    </span>
                  </div>
                )}
              </div>

              {/* Reason Select */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  <option value="restock">Regular Restock</option>
                  <option value="purchase">New Purchase</option>
                  <option value="return">Customer Return</option>
                  <option value="transfer_in">Transfer In</option>
                  <option value="adjustment">Inventory Adjustment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Notes Textarea */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  placeholder="Add any additional notes..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Warning if near max */}
              {isNearMax() && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Warning: Near maximum capacity</p>
                    <p className="text-yellow-700">
                      The new stock level will be close to or at the maximum limit.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  disabled={loading || !quantity || parseInt(quantity) <= 0}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Restocking...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Stock</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default RestockModal

