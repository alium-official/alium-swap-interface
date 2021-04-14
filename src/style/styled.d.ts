// eslint-disable-next-line import/no-unresolved
import { AliumTheme } from '@aliumswap/uikit/dist/theme'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends AliumTheme {}
}
