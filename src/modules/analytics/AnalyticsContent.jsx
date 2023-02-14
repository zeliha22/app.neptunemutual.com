import { useState, useEffect } from 'react'
import { AnalyticsTitle } from '@/src/modules/analytics/AnalyticsTitle'
import { useNetworkStats } from '@/src/hooks/useNetworkStats'
import { useProtocolDayData } from '@/src/hooks/useProtocolDayData'
import { useProtocolUsersData } from '@/src/hooks/useProtocolUsersData'
import { useFetchAnalyticsTVLStats } from '@/src/services/aggregated-stats/analytics'
import useCoverEarningAnalytics from '@/src/hooks/useCoverEarningAnalytics'
import PreviousNext from '@/common/PreviousNext'
import { AnalyticsStats } from '@/modules/analytics/AnalyticsStats'
import { AnalyticsTVLTable } from '@/modules/analytics/AnalyticsTVLTable'
import CoverEarning from '@/modules/analytics/CoverEarning'
import { TotalCapacityChart } from '@/common/TotalCapacityChart'
import { TopAccounts } from '@/modules/analytics/TopAccounts'
import { TOP_ACCOUNTS_ROWS_PER_PAGE } from '@/src/config/constants'
import Consensus from '@/modules/analytics/Consensus'

const AllDropdownOptions = {
  TVL_DISTRIBUTION: 'TVL Distribution',
  QUICK_INFO: 'Quick Info',
  GROWTH: 'Growth',
  DEMAND: 'Demand',
  COVER_TVL: 'Cover TVL',
  POOL_TVL: 'Pool TVL',
  OTHER_INSIGHTS: 'Other Insights',
  TOP_ACCOUNTS: 'Top Accounts',
  PREMIUM: 'Premium Earned',
  COVER_EARNINGS: 'Cover Earnings',
  IN_CONSENSUS: 'In Consensus'
}

const dropdownLabels = [AllDropdownOptions.GROWTH, AllDropdownOptions.OTHER_INSIGHTS]

const DROPDOWN_OPTIONS = Object.values(AllDropdownOptions).map(value => ({
  label: value, value: value, type: dropdownLabels.includes(value) ? 'label' : 'option'
}))

export const AnalyticsContent = () => {
  const [selectedValue, setSelectedValue] = useState(AllDropdownOptions.IN_CONSENSUS)
  const [selected, setSelected] = useState(DROPDOWN_OPTIONS.find((option) => option.value === AllDropdownOptions.IN_CONSENSUS))

  useEffect(() => {
    if (selected) {
      setSelectedValue(selected.value)
    }
  }, [selected])

  const { data: statsData, loading } = useNetworkStats()

  const { data: { totalCovered, totalLiquidity } } = useProtocolDayData()
  const { data: userData } = useProtocolUsersData()

  const { data: TVLStats, loading: tvlStatsLoading } = useFetchAnalyticsTVLStats()

  const [currentPage, setCurrentPage] = useState(1)
  const {
    hasNext: coverEarningHasNext,
    hasPrevious: coverEarningHasPrevious,
    labels,
    onNext: onCoverEarningNext,
    onPrevious: onCoverEarningPrevious,
    yAxisData
  } = useCoverEarningAnalytics()

  const ReportLabels = (
    <div className='text-21AD8C text-sm leading-5'>
      {tvlStatsLoading ? '' : `${statsData?.combined?.availableCovers} Covers, ${statsData?.combined?.reportingCovers} Reporting`}
    </div>
  )

  const getTrailingTitleComponent = () => {
    switch (selectedValue) {
      case AllDropdownOptions.COVER_EARNINGS:
        return (
          <PreviousNext
            onNext={onCoverEarningNext}
            onPrevious={onCoverEarningPrevious}
            hasNext={coverEarningHasNext}
            hasPrevious={coverEarningHasPrevious}
          />
        )
      case AllDropdownOptions.TOP_ACCOUNTS:
        return (
          <PreviousNext
            onNext={() => setCurrentPage(currentPage + 1)}
            onPrevious={() => setCurrentPage(currentPage - 1)}
            hasNext={currentPage < (Math.abs(userData.length / TOP_ACCOUNTS_ROWS_PER_PAGE))}
            hasPrevious={currentPage > 1}
          />
        )
      default:
        return ReportLabels
    }
  }

  const getAnalyticsComponent = () => {
    switch (selectedValue) {
      case AllDropdownOptions.TVL_DISTRIBUTION:
        return (
          <>
            <AnalyticsStats loading={loading} statsData={statsData} />
            <AnalyticsTVLTable data={TVLStats} loading={tvlStatsLoading} />
          </>
        )
      case AllDropdownOptions.DEMAND:
        return <TotalCapacityChart data={totalCovered} />
      case AllDropdownOptions.COVER_TVL:
        return <TotalCapacityChart data={totalLiquidity} />
      case AllDropdownOptions.TOP_ACCOUNTS:
        return <TopAccounts userData={userData} page={currentPage} />
      case AllDropdownOptions.COVER_EARNINGS:
        return (
          <CoverEarning labels={labels} yAxisData={yAxisData} />
        )
      case AllDropdownOptions.IN_CONSENSUS:
        return (
          <Consensus />
        )
      default:
        return null
    }
  }

  return (
    <>
      <AnalyticsTitle
        setSelected={setSelected}
        selected={selected}
        options={DROPDOWN_OPTIONS}
        trailing={getTrailingTitleComponent()}
      />

      <div>
        {getAnalyticsComponent()}
      </div>
    </>
  )
}
