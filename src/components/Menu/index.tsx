import React from 'react'
import { Menu as UikitMenu, MenuEntry, useModal } from '@aliumswap/uikit'
import { useWeb3React } from '@web3-react/core'
import { useTranslation } from 'react-i18next'
import useTheme from 'hooks/useTheme'
import useAuth from 'hooks/useAuth'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { ETHER, ChainId } from '@aliumswap/sdk'
import { getExplorerLink, getExplorerName } from 'utils'
import { useActiveWeb3React } from 'hooks'
import RecentTransactionsModal from '../PageHeader/RecentTransactionsModal'

const Menu: React.FC<{ loginBlockVisible?: boolean }> = ({ loginBlockVisible, ...props }) => {
  const { t } = useTranslation()

  const links: MenuEntry[] = [
    {
      label: t('mainMenu.home'),
      icon: 'HomeIcon',
      href: process.env.REACT_APP_HOME_URL,
    },
    {
      label: t('mainMenu.trade'),
      icon: 'TradeIcon',
      items: [
        {
          label: t('swap'),
          href: '/swap',
        },
        {
          label: t('mainMenu.liquidity'),
          href: '/pool',
        },
        // {
        //   label: 'Migrate',
        //   href: '/migrate',
        // },
      ],
    },
    {
      label: 'Analytics',
      icon: 'InfoIcon',
      items: [
        {
          label: 'Overview',
          href: process.env.REACT_APP_INFO_URL as string,
        },
        {
          label: 'Tokens',
          href: `${process.env.REACT_APP_INFO_URL}/tokens`,
        },
        {
          label: 'Pairs',
          href: `${process.env.REACT_APP_INFO_URL}/pairs`,
        },
      ],
    },
    {
      label: t('mainMenu.more'),
      icon: 'MoreIcon',
      items: [
        // {
        //   label: 'Voting',
        //   href: 'https://voting.dev.alium.finance',
        // },
        {
          label: t('mainMenu.github'),
          href: 'https://github.com/Aliumswap',
        },
        {
          label: t('mainMenu.docs'),
          href: 'https://aliumswap.gitbook.io/alium-finance',
        },
        {
          label: t('mainMenu.blog'),
          href: 'https://medium.com/@aliumswap',
        },
      ],
    },
  ]

  const { account } = useWeb3React()
  const { chainId } = useActiveWeb3React()
  const { login, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const balance = useCurrencyBalance(account as string, ETHER)
  const explorerName = getExplorerName(chainId as ChainId)
  const explorerLink = getExplorerLink(chainId as ChainId, account as string, 'address')
  const useBalance = async () => {
    const result = await useCurrencyBalance(account as string, ETHER)
    return result
  }

  // useBalance().then((result)=>console.log(result))

  const [transactionsHistoryModal] = useModal(<RecentTransactionsModal />)

  return (
    <UikitMenu
      // isProduction={process.env.NODE_ENV === "production"}
      links={links}
      account={account as string}
      login={login}
      logout={logout}
      isDark={isDark}
      toggleTheme={toggleTheme}
      loginBlockVisible={loginBlockVisible}
      buttonTitle={t('connect')}
      balance={balance?.toSignificant(6)}
      explorerName={explorerName}
      explorerLink={explorerLink}
      options={{
        modalTitle: 'Account',
        modalFooter: t('learnHowConnect'),
        modelLogout: t('logout'),
        modalBscScan: t('viewOnBscscan'),
        modelCopyAddress: t('copyAddress'),
      }}
      onTransactionHistoryHandler={transactionsHistoryModal}
      betaText="This is the main version. Press here to switch to Beta."
      betaLink="https://beta.exchange.alium.finance"
      balanceHook={useBalance}
      {...props}
    />
  )
}

export default Menu
