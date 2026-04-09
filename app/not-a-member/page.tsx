import type { FC } from 'react'

interface Props {
  searchParams: Promise<{ expired?: string }>
}

const NotAMemberPage: FC<Props> = async ({ searchParams }) => {
  const { expired } = await searchParams
  const isExpired = expired === '1'

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD60A]/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">
            {isExpired ? 'Přístup vypršel' : 'Pouze pro členy SellingHub'}
          </h1>
          <p className="text-gray-400 leading-relaxed">
            {isExpired
              ? 'Vaše přihlášení vypršelo. Přejděte zpět do kurzu SellingHub a stránku otevřete znovu.'
              : 'Tento nástroj je dostupný výhradně pro členy SellingHub. Pro přístup se přihlaste ke svému účtu v kurzu.'}
          </p>
        </div>

        {!isExpired && (
          <p className="text-sm text-gray-500">
            Nejste ještě členem?{' '}
            <a
              href="https://sellinghub.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD60A] hover:underline"
            >
              Zjistěte více na sellinghub.cz
            </a>
          </p>
        )}

        {isExpired && (
          <p className="text-sm text-gray-500">
            Pokud problém přetrvává, kontaktujte podporu na{' '}
            <a href="mailto:podpora@sellinghub.cz" className="text-[#FFD60A] hover:underline">
              podpora@sellinghub.cz
            </a>
          </p>
        )}

      </div>
    </div>
  )
}

export default NotAMemberPage
