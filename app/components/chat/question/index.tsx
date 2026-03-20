'use client'
import type { FC } from 'react'
import React from 'react'
import type { IChatItem } from '../type'

import StreamdownMarkdown from '@/app/components/base/streamdown-markdown'
import ImageGallery from '@/app/components/base/image-gallery'

type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
  imgSrcs?: string[]
}

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar, imgSrcs }) => {
  const userName = 'Ty'

  return (
    <div className='flex items-start justify-end mb-8 w-full' key={id}>
      <div className='max-w-[85%] tablet:max-w-[75%]'>
        {/* The Luxury Dark Gradient Bubble with Golden Trim */}
        <div className={'relative text-sm text-gray-100 font-light tracking-wide leading-relaxed'}>
          <div
            className={'mr-3 py-3.5 px-5 bg-gradient-to-br from-[#1e222a] to-[#0c0e12] border border-[#FFD60A]/20 shadow-[0_8px_30px_rgba(255,214,10,0.04)] rounded-2xl rounded-tr-sm'}
          >
            {imgSrcs && imgSrcs.length > 0 && (
              <ImageGallery srcs={imgSrcs} />
            )}
            <StreamdownMarkdown content={content} />
          </div>
        </div>
      </div>

      {/* The Sleek User Avatar */}
      {useCurrentUserAvatar
        ? (
          <div className='w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-[#1e222a] to-[#0c0e12] border border-[#FFD60A]/30 text-[#FFD60A] font-medium shadow-lg'>
            {userName?.[0].toLocaleUpperCase()}
          </div>
        )
        : (
          <div className='w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-[#1e222a] to-[#0c0e12] border border-white/10 shadow-lg'>
            {/* Custom Modern User SVG Icon */}
            <svg className="w-4 h-4 text-[#FFD60A]/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
    </div>
  )
}

export default React.memo(Question)
