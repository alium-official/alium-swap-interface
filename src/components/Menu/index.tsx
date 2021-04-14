import React, { useContext } from 'react'
import { Menu as UikitMenu, MenuEntry } from '@aliumswap/uikit-beta'
import { useWeb3React } from '@web3-react/core'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from 'hooks/LanguageContext'
import useTheme from 'hooks/useTheme'
import useAuth from 'hooks/useAuth'
import useGetPriceData from 'hooks/useGetPriceData'
import useGetLocalProfile from 'hooks/useGetLocalProfile'
import { allLanguages } from 'constants/localisation/languageCodes'

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
    // {
    //   label: 'Farms',
    //   icon: 'FarmIcon',
    //   href: '/farms',
    // },
    // {
    //   label: 'Pools',
    //   icon: 'PoolIcon',
    //   href: '/pools',
    // },
    // {
    //   label: 'Lottery',
    //   icon: 'TicketIcon',
    //   href: '/lottery',
    // },
    // {
    //   label: 'NFT',
    //   icon: 'NftIcon',
    //   href: '/nft',
    // },
    // {
    //   label: 'Teams & Profile',
    //   icon: 'GroupsIcon',
    //   calloutClass: 'rainbow',
    //   items: [
    //     {
    //       label: 'Leaderboard',
    //       href: '/teams',
    //     },
    //     {
    //       label: 'Task Center',
    //       href: '/profile/tasks',
    //     },
    //     {
    //       label: 'Your Profile',
    //       href: '/profile',
    //     },
    //   ],
    // },
    // {
    //   label: 'Info',
    //   icon: 'InfoIcon',
    //   items: [
    //     {
    //       label: 'Overview',
    //       href: 'https://info.dev.alium.finance',
    //     },
    //     {
    //       label: 'Tokens',
    //       href: 'https://info.dev.alium.finance/tokens',
    //     },
    //     {
    //       label: 'Pairs',
    //       href: 'https://info.dev.alium.finance/pairs',
    //     },
    //     {
    //       label: 'Accounts',
    //       href: 'https://info.dev.alium.finance/accounts',
    //     },
    //   ],
    // },
    // {
    //   label: 'IFO',
    //   icon: 'IfoIcon',
    //   href: '/ifo',
    // },
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
  const { login, logout } = useAuth()

  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext)
  const { isDark, toggleTheme } = useTheme()
  const priceData = useGetPriceData()
  const cakePriceUsd = priceData ? Number(priceData.prices.Cake) : undefined
  const profile = useGetLocalProfile()

  return (
    <UikitMenu
      links={links}
      account={account as string}
      login={login}
      logout={logout}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={selectedLanguage?.code || ''}
      langs={allLanguages}
      setLang={setSelectedLanguage}
      cakePriceUsd={cakePriceUsd}
      profile={profile}
      loginBlockVisible={loginBlockVisible}
      buttonTitle={t('connect')}
      options={{
        modalTitle: "Your wallet",
        modalFooter: t('learnHowConnect'),
        modelLogout: t('logout'),
        modalBscScan: t('viewOnBscscan'),
        modelCopyAddress: t('copyAddress'),
      }}
      {...props}
    />
  )
}

export default Menu
