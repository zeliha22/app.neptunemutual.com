import { useRouter } from 'next/router'

import { StatsCard } from '@/src/modules/insights/StatsCard'
import { formatCurrency } from '@/utils/formatter/currency'
import { Trans } from '@lingui/macro'

export const InsightsStats = ({ loading, statsData }) => {
  const router = useRouter()

  return (
    <div>
      {loading ? <Trans>loading...</Trans> : <StatDisplay router={router} statsData={statsData} />}
    </div>
  )
}

const StatDisplay = ({ router, statsData }) => {
  return (
    <div className='grid flex-wrap items-start justify-between pb-6 grid-cols-analytics-stat-cards lg:flex lg:pb-10 gap-x-2 gap-y-4'>
      <StatsCard
        titleClass='text-999BAB lg:text-404040'
        valueClass='uppercase'
        title='Total Capacity'
        value={
        formatCurrency(
          statsData?.combined?.totalCapacity || 0,
          router.locale
        ).short
      }
        tooltip={
        formatCurrency(
          statsData?.combined?.totalCapacity || 0,
          router.locale
        ).long
      }
      />
      <StatsCard
        titleClass='text-999BAB lg:text-404040'
        valueClass='uppercase'
        title='Covered'
        value={
        formatCurrency(
          statsData?.combined?.totalCoveredAmount,
          router.locale
        ).short
      }
        tooltip={
        formatCurrency(
          statsData?.combined?.totalCoveredAmount,
          router.locale
        ).long
      }
      />
      <StatsCard
        titleClass='text-999BAB lg:text-404040'
        valueClass='uppercase'
        title='Commitment' value={
        formatCurrency(
          statsData?.combined?.activeCoveredAmount,
          router.locale
        ).short
      }
        tooltip={
        formatCurrency(
          statsData?.combined?.activeCoveredAmount,
          router.locale
        ).long
      }
      />
      <StatsCard
        titleClass='text-999BAB lg:text-404040'
        valueClass='uppercase'
        title='Cover Fee'
        value={
        formatCurrency(
          statsData?.combined?.totalCoverFee,
          router.locale
        ).short
      }
        tooltip={
        formatCurrency(
          statsData?.combined?.totalCoverFee,
          router.locale
        ).long
      }
      />
    </div>
  )
}
