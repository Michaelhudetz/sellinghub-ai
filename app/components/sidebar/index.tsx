import React from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
import type { ConversationItem } from '@/types/app'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20

export interface ISidebarProps {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  list: ConversationItem[]
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  list,
}) => {
  const { t } = useTranslation()
  return (
    <div
      className="shrink-0 flex flex-col overflow-y-auto bg-[#0c0e12]/90 backdrop-blur-2xl pc:w-[260px] tablet:w-[220px] mobile:w-[240px] border-r border-white/5 tablet:h-[calc(100vh_-_3rem)] mobile:h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
    >
      {/* --- NEW CHAT BUTTON --- */}
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className="flex flex-shrink-0 p-4 !pb-0 mt-2">
          <Button
            onClick={() => { onCurrentIdChange('-1') }}
            className="group block w-full flex-shrink-0 !justify-start !h-11 items-center text-sm font-medium !bg-transparent !border !border-[#FFD60A]/30 !text-[#FFD60A] hover:!bg-[#FFD60A]/10 hover:!border-[#FFD60A]/60 transition-all duration-300 rounded-xl shadow-[0_0_15px_rgba(255,214,10,0.05)]"
          >
            <PencilSquareIcon className="mr-3 h-5 w-5" /> {t('app.chat.newChat')}
          </Button>
        </div>
      )}

      {/* --- CHAT HISTORY LIST --- */}
      <nav className="mt-6 flex-1 space-y-2 p-4 !pt-0">
        {list.map((item) => {
          const isCurrent = item.id === currentId
          const ItemIcon = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon

          return (
            <div
              onClick={() => onCurrentIdChange(item.id)}
              key={item.id}
              className={classNames(
                isCurrent
                  ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20 shadow-[0_0_10px_rgba(255,214,10,0.05)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent',
                'group flex items-center rounded-xl px-3 py-3 text-sm font-medium cursor-pointer transition-all duration-200 overflow-hidden',
              )}
            >
              <ItemIcon
                className={classNames(
                  isCurrent
                    ? 'text-[#FFD60A]'
                    : 'text-gray-500 group-hover:text-gray-300',
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </div>
          )
        })}
      </nav>

      {/* --- FOOTER --- */}
      <div className="flex flex-shrink-0 pr-4 pb-4 pl-5">
        <div className="text-gray-600 font-normal text-xs tracking-wider flex items-center gap-1">
          © {new Date().getFullYear()}
          <a
            href="https://tvoje-stranka.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#FFD60A] transition-colors duration-200 ml-1"
          >
            Vytvořil Michael Hudetz
          </a>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Sidebar)
