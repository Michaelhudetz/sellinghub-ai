'use client'
import type { FC, ReactNode } from 'react'
import React from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { StarIcon } from '@/app/components/welcome/massive-component'

export interface ITemplateVarPanelProps {
  className?: string
  header: ReactNode
  children?: ReactNode | null
  isFold: boolean
}

const TemplateVarPanel: FC<ITemplateVarPanelProps> = ({
  className,
  header,
  children,
  isFold,
}) => {
  return (
    <div className={cn(className, 'rounded-2xl border border-white/10 bg-[#1a1d24]/60 backdrop-blur-2xl shadow-lg transition-all duration-300 overflow-hidden mb-6')}>
      {/* Header Area */}
      <div
        className={cn('px-6 py-4 flex flex-col justify-center', !isFold && 'border-b border-white/5 bg-white/5')}
      >
        {header}
      </div>

      {/* Body Area (Expanded Form) */}
      {!isFold && children && (
        <div className='p-6'>
          {children}
        </div>
      )}
    </div>
  )
}

export const PanelTitle: FC<{ title: string, className?: string }> = ({
  title,
  className,
}) => {
  return (
    <div className={cn(className, 'flex items-center space-x-2 text-[#FFD60A]')}>
      <StarIcon />
      <span className='text-sm font-medium text-gray-200 tracking-wide'>{title}</span>
    </div>
  )
}

export const VarOpBtnGroup: FC<{ className?: string, onConfirm: () => void, onCancel: () => void }> = ({
  className,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()

  return (
    <div className={cn(className, 'flex mt-8 space-x-3 w-full justify-end')}>
      {/* Custom Sleek Cancel Button */}
      <button
        onClick={onCancel}
        className='text-sm font-medium text-gray-400 hover:text-white bg-transparent hover:bg-white/5 border border-white/10 py-2.5 px-5 rounded-xl transition-all'
      >
        {t('common.operation.cancel')}
      </button>

      {/* Custom Glowing Save Button */}
      <button
        onClick={onConfirm}
        className='text-sm font-medium text-black bg-[#FFD60A] hover:bg-[#e5c009] shadow-[0_0_15px_rgba(255,214,10,0.15)] hover:shadow-[0_0_20px_rgba(255,214,10,0.3)] py-2.5 px-6 rounded-xl transition-all transform hover:scale-105'
      >
        {t('common.operation.save')}
      </button>
    </div >
  )
}

export default React.memo(TemplateVarPanel)
