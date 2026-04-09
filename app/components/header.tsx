'use client'
import type { FC } from 'react'
import React from 'react'
import {
  Bars3Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid'

export interface IHeaderProps {
  title: string
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
}

const Header: FC<IHeaderProps> = ({
  title,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-between h-14 px-4 bg-[#0c0e12]/80 backdrop-blur-md border-b border-white/5 z-30 sticky top-0 shadow-sm">

      {/* Mobile Menu Icon */}
      {isMobile
        ? (
          <div
            className='flex items-center justify-center h-9 w-9 cursor-pointer rounded-lg hover:bg-white/10 transition-colors'
            onClick={() => onShowSideBar?.()}
          >
            <Bars3Icon className="h-5 w-5 text-gray-400" />
          </div>
        )
        : <div className="w-9"></div> /* Spacer for perfect centering on desktop */}

      {/* The Brand Centerpiece */}
      <div className='flex items-center space-x-3 absolute left-1/2 transform -translate-x-1/2'>
        <img
          src="/Sellinghub-ai-logo-white.svg"
          alt="Sellinghub AI Logo"
          className="h-5 w-auto opacity-90"
        />
        <div className="text-[11px] mobile:text-[11px] tablet:text-[15px] text-gray-200 font-medium tracking-wide text-center">
          AI dopisář
        </div>
      </div>

      {/* Mobile New Chat Icon */}
      {isMobile
        ? (
          <div
            className='flex items-center justify-center h-9 w-9 cursor-pointer rounded-lg hover:bg-white/10 transition-colors'
            onClick={() => onCreateNewChat?.()}
          >
            <PencilSquareIcon className="h-5 w-5 text-[#FFD60A]" />
          </div>)
        : <div className="w-9"></div> /* Spacer for perfect centering on desktop */}
    </div>
  )
}

export default React.memo(Header)
