import React from 'react'
import { useSelector } from 'react-redux'
import { ToastContainer, Toast } from '@alium-official/uikit'
import useToast from 'state/hooks'

const ToastListener = () => {
  const toasts: Toast[] = useSelector((state: any) => state?.toasts?.data) || []
  const { remove } = useToast()

  const handleRemove = (id: string) => remove(id)

  return <ToastContainer toasts={toasts} onRemove={handleRemove} />
}

export default ToastListener
