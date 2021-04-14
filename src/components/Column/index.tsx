import styled from 'styled-components'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  triggerMobile?: boolean
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
  ${({ triggerMobile }) =>
    triggerMobile &&
    `
    @media screen and (max-width: 576px){
        padding: 0 !important;
        > div > div {
          font-size: 11px;
        }
         > div > div > div{
          font-size: 11px;
        }
    }
  `}
`

export default Column
