import React, { useEffect, useState } from 'react'

import { Container } from '@/common/Container/Container'
import { HomeCard } from '@/common/HomeCard/HomeCard'
import { HomeMainCard } from '@/common/HomeCard/HomeMainCard'
import IncreaseIcon from '@/icons/IncreaseIcon'
import { Hero } from '@/common/Hero'
import { TotalCapacityChart } from '@/common/TotalCapacityChart'
import { useFetchHeroStats } from '@/src/hooks/useFetchHeroStats'
import { formatCurrency } from '@/utils/formatter/currency'
import { convertFromUnits, toBN } from '@/utils/bn'
import { useProtocolDayData } from '@/src/hooks/useProtocolDayData'
import { classNames } from '@/utils/classnames'
import { useAppConstants } from '@/src/context/AppConstants'
import { formatPercent } from '@/utils/formatter/percent'
import { t, Trans } from '@lingui/macro'
import { useRouter } from 'next/router'
import { BreadCrumbs } from '@/common/BreadCrumbs/BreadCrumbs'

export const HomeHero = ({ breadcrumbs = [], title = '' }) => {
  const { data: heroData } = useFetchHeroStats()
  const { poolsTvl, liquidityTokenDecimals } = useAppConstants()
  const router = useRouter()

  const [changeData, setChangeData] = useState(null)
  const { data: { totalCapacity } } = useProtocolDayData()

  const currentCapacity = (totalCapacity && totalCapacity.length > 0) ? totalCapacity[totalCapacity.length - 1].value : '0'

  useEffect(() => {
    if (totalCapacity && totalCapacity.length >= 2) {
      const lastSecond = toBN(totalCapacity[totalCapacity.length - 2].value)
      const last = toBN(totalCapacity[totalCapacity.length - 1].value)

      const diff =
        lastSecond.isGreaterThan(0) &&
        last.minus(lastSecond).dividedBy(lastSecond)
      setChangeData({
        last: last.toString(),
        diff: diff && diff.absoluteValue().toString(),
        rise: diff && diff.isGreaterThanOrEqualTo(0)
      })
    } else if (totalCapacity && totalCapacity.length === 1) {
      setChangeData({
        last: toBN(totalCapacity[0].value).toString(),
        diff: null,
        rise: false
      })
    }
  }, [totalCapacity])

  return (
    <Hero big>
      {Boolean(breadcrumbs.length) && (
        <Container className='pt-9'>
          <BreadCrumbs pages={breadcrumbs} />
        </Container>
      )}
      {title && (
        <Container className='pt-0'>
          <h2 className='font-bold text-black text-h2 font-inter mb-14'>
            {title}
          </h2>
        </Container>
      )}
      <Container
        className={classNames(
          'flex flex-col-reverse justify-between lg:gap-8 py-10 md:py-16 md:px-10 lg:py-28 md:flex-col-reverse lg:flex-row'
        )}
      >
        <div className='pt-10 md:flex lg:flex-col md:gap-4 md:w-full lg:w-auto lg:pt-0'>
          <div className='flex-1 lg:flex-2 lg:flex lg:flex-col'>
            <div
              className='flex mb-2 md:mb-0 lg:mb-8 md:justify-center lg:justify-start lg:flex-1'
              data-testid='tvl-homecard'
            >
              <HomeCard
                items={[
                  {
                    name: t`Capacity`,
                    amount: formatCurrency(
                      convertFromUnits(
                        currentCapacity,
                        liquidityTokenDecimals
                      ).toString(),
                      router.locale
                    ).short
                  },
                  {
                    name: t`TVL (Pool)`,
                    amount: formatCurrency(
                      convertFromUnits(
                        poolsTvl,
                        liquidityTokenDecimals
                      ).toString(),
                      router.locale
                    ).short
                  }
                ]}
                className='md:border-0.5 md:border-B0C4DB md:rounded-tl-xl md:rounded-tr-xl'
              />
            </div>
            <div
              className='flex mb-2 md:mb-0 lg:mb-8 md:justify-center lg:justify-start lg:flex-1'
              data-testid='cover-homecard'
            >
              <HomeCard
                items={[
                  {
                    // Active Protection (or) Commitment
                    name: t`Coverage`,
                    amount: formatCurrency(
                      convertFromUnits(
                        heroData.covered,
                        liquidityTokenDecimals
                      ).toString(),
                      router.locale
                    ).short
                  },
                  {
                    name: t`Cover Fee`,
                    amount: formatCurrency(
                      convertFromUnits(
                        heroData.coverFee,
                        liquidityTokenDecimals
                      ).toString(),
                      router.locale
                    ).short
                  }
                ]}
                className='md:border-0.5 md:border-t-0 md:border-B0C4DB md:border-t-transparent md:rounded-bl-xl md:rounded-br-xl'
              />
            </div>
          </div>
          <div
            className='flex flex-1 md:justify-center lg:justify-start'
            data-testid='homemaincard'
          >
            <HomeMainCard heroData={heroData} />
          </div>
        </div>

        <div className='flex flex-col flex-1 min-w-0 bg-white rounded-2xl shadow-homeCard px-6 py-8 lg:p-14 border-0.5 border-B0C4DB'>
          <div className='mb-8'>
            <h3 className='mb-1 text-sm leading-5 font-inter text-9B9B9B'>
              <Trans>Total Capacity</Trans>
            </h3>
            <div className='flex items-center'>
              <h2
                className='pr-3 font-bold text-black text-h4 xs:text-h3 font-inter'
                data-testid='changedata-currency'
              >
                {
                  formatCurrency(
                    convertFromUnits(
                      changeData?.last || '0',
                      liquidityTokenDecimals
                    ).toString(),
                    router.locale
                  ).short
                }
              </h2>
              {changeData && changeData.diff && (
                <p
                  className={classNames(
                    'text-h7 xs:text-h6 font-inter font-bold flex items-center',
                    changeData.rise ? 'text-21AD8C' : 'text-DC2121'
                  )}
                  data-testid='changedata-percent'
                >
                  <span
                    className='pr-1'
                    title={changeData.rise ? 'Growth' : 'Decline'}
                  >
                    <span className='sr-only'>Growth</span>
                    <IncreaseIcon
                      width={19}
                      className={changeData.rise ? '' : 'transform-flip'}
                    />
                  </span>
                  <span>{formatPercent(changeData.diff, router.locale)}</span>
                </p>
              )}
            </div>
          </div>
          <div
            className='flex-1 min-h-360'
            data-testid='liquidity-chart-wrapper'
          >
            <TotalCapacityChart data={totalCapacity} />
          </div>
        </div>
      </Container>
      <hr className='border-b border-B0C4DB' />
    </Hero>
  )
}
