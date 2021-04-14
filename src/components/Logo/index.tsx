import React, { useState } from 'react'
import { CoinLogoIcon } from '@aliumswap/uikit-beta'
import styled from 'styled-components'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export interface LogoProps {
  alt?: string
  style?: any
  className?: string
  srcs: string[]
}

const StyledCoinLogoIcon = styled(CoinLogoIcon)`
  background: #FFFFFF;
  // box-shadow: 0px 6px 12px rgba(185, 189, 208, 0.4);
  border-radius: 16px;
  // width: 18px;
  // height: 18px;
`

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }: LogoProps) {
  const [, refresh] = useState<number>(0)

  const src: string | undefined = srcs.find((s) => !BAD_SRCS[s])

  if (src) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          if (src) BAD_SRCS[src] = true
          refresh((i) => i + 1)
        }}
      />
    )
  }

  return <StyledCoinLogoIcon {...rest} />
}
