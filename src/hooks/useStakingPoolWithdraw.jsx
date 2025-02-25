import { useState } from 'react'

import { useRouter } from 'next/router'

import { NetworkNames } from '@/lib/connect-wallet/config/chains'
import { getProviderOrSigner } from '@/lib/connect-wallet/utils/web3'
import { useNetwork } from '@/src/context/Network'
import { useTxPoster } from '@/src/context/TxPoster'
import { getActionMessage } from '@/src/helpers/notification'
import { useErrorNotifier } from '@/src/hooks/useErrorNotifier'
import { useTokenDecimals } from '@/src/hooks/useTokenDecimals'
import { useTokenSymbol } from '@/src/hooks/useTokenSymbol'
import { useTxToast } from '@/src/hooks/useTxToast'
import { METHODS } from '@/src/services/transactions/const'
import {
  STATUS,
  TransactionHistory
} from '@/src/services/transactions/transaction-history'
import {
  convertFromUnits,
  convertToUnits
} from '@/utils/bn'
import { formatCurrency } from '@/utils/formatter/currency'
import { t } from '@lingui/macro'
import { registry } from '@neptunemutual/sdk'
import { useWeb3React } from '@web3-react/core'

export const useStakingPoolWithdraw = ({
  value,
  poolKey,
  poolInfo,
  tokenSymbol,
  refetchInfo
}) => {
  const [withdrawing, setWithdrawing] = useState(false)

  const { networkId } = useNetwork()
  const { account, library } = useWeb3React()
  const router = useRouter()

  const txToast = useTxToast()
  const { writeContract } = useTxPoster()
  const { notifyError } = useErrorNotifier()

  const stakingTokenDecimals = useTokenDecimals(poolInfo?.stakingToken)
  const stakingTokenSymbol = useTokenSymbol(poolInfo?.stakingToken)

  const handleWithdraw = async (onTxSuccess) => {
    if (!account || !networkId) {
      return
    }

    setWithdrawing(true)

    const cleanup = () => {
      refetchInfo()
      setWithdrawing(false)
    }
    const handleError = (err) => {
      notifyError(err, t`Could not unstake ${tokenSymbol}`)
    }

    try {
      const signerOrProvider = getProviderOrSigner(library, account, networkId)

      const instance = await registry.StakingPools.getInstance(
        networkId,
        signerOrProvider
      )

      const onTransactionResult = async (tx) => {
        const logData = {
          network: NetworkNames[networkId],
          networkId,
          sales: 'N/A',
          salesCurrency: 'N/A',
          salesFormatted: 'N/A',
          account,
          tx: tx.hash,
          poolKey,
          poolName: poolInfo.name,
          withdrawal: value,
          withdrawalCurrency: tokenSymbol,
          withdrawalFormatted: formatCurrency(value, router.locale, tokenSymbol, true).short,
          stake: convertFromUnits(poolInfo.myStake, stakingTokenDecimals).toString(),
          stakeCurrency: stakingTokenSymbol,
          stakeFormatted: formatCurrency(convertFromUnits(poolInfo?.myStake, stakingTokenDecimals).toString(), router.locale, stakingTokenSymbol, true).short
        }

        TransactionHistory.push({
          hash: tx.hash,
          methodName: METHODS.UNSTAKING_DEPOSIT,
          status: STATUS.PENDING,
          data: {
            value,
            tokenSymbol,
            logData
          }
        })

        await txToast.push(
          tx,
          {
            pending: getActionMessage(
              METHODS.UNSTAKING_DEPOSIT,
              STATUS.PENDING,
              {
                value,
                tokenSymbol
              }
            ).title,
            success: getActionMessage(
              METHODS.UNSTAKING_DEPOSIT,
              STATUS.SUCCESS,
              {
                value,
                tokenSymbol
              }
            ).title,
            failure: getActionMessage(
              METHODS.UNSTAKING_DEPOSIT,
              STATUS.FAILED,
              {
                value,
                tokenSymbol
              }
            ).title
          },
          {
            onTxSuccess: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_DEPOSIT,
                status: STATUS.SUCCESS,
                data: {
                  value,
                  tokenSymbol
                }
              })

              onTxSuccess()
            },
            onTxFailure: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_DEPOSIT,
                status: STATUS.FAILED,
                data: {
                  value,
                  tokenSymbol
                }
              })
            }
          }
        )

        cleanup()
      }

      const onRetryCancel = () => {
        cleanup()
      }

      const onError = (err) => {
        handleError(err)
        cleanup()
      }

      const args = [poolKey, convertToUnits(value).toString()]
      writeContract({
        instance,
        methodName: 'withdraw',
        onTransactionResult,
        onRetryCancel,
        onError,
        args
      })
    } catch (err) {
      handleError(err)
      cleanup()
    }
  }

  return {
    withdrawing,
    handleWithdraw
  }
}

export const useStakingPoolWithdrawRewards = ({ poolKey, refetchInfo, rewardTokenSymbol, rewardAmount }) => {
  const [withdrawingRewards, setWithdrawingRewards] = useState(false)

  const { networkId } = useNetwork()
  const { account, library } = useWeb3React()
  const txToast = useTxToast()
  const { writeContract } = useTxPoster()
  const { notifyError } = useErrorNotifier()

  const handleWithdrawRewards = async (onTxSuccess) => {
    if (!account || !networkId) {
      return
    }

    setWithdrawingRewards(true)

    const cleanup = () => {
      refetchInfo()
      setWithdrawingRewards(false)
    }
    const handleError = (err) => {
      notifyError(err, t`Could not withdraw rewards`)
    }

    try {
      const signerOrProvider = getProviderOrSigner(library, account, networkId)

      const instance = await registry.StakingPools.getInstance(
        networkId,
        signerOrProvider
      )

      const onTransactionResult = async (tx) => {
        TransactionHistory.push({
          hash: tx.hash,
          methodName: METHODS.UNSTAKING_WITHDRAW,
          status: STATUS.PENDING,
          data: {
            value: rewardAmount,
            tokenSymbol: rewardTokenSymbol
          }
        })

        await txToast.push(
          tx,
          {
            pending: getActionMessage(
              METHODS.UNSTAKING_WITHDRAW,
              STATUS.PENDING, {
                value: rewardAmount,
                tokenSymbol: rewardTokenSymbol
              }
            ).title,
            success: getActionMessage(
              METHODS.UNSTAKING_WITHDRAW,
              STATUS.SUCCESS, {
                value: rewardAmount,
                tokenSymbol: rewardTokenSymbol
              }
            ).title,
            failure: getActionMessage(METHODS.UNSTAKING_WITHDRAW, STATUS.FAILED, {
              value: rewardAmount,
              tokenSymbol: rewardTokenSymbol
            })
              .title
          },
          {
            onTxSuccess: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_WITHDRAW,
                status: STATUS.SUCCESS,
                data: {
                  value: rewardAmount,
                  tokenSymbol: rewardTokenSymbol
                }
              })

              onTxSuccess()
            },
            onTxFailure: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_WITHDRAW,
                status: STATUS.FAILED,
                data: {
                  value: rewardAmount,
                  tokenSymbol: rewardTokenSymbol
                }
              })
            }
          }
        )

        cleanup()
      }

      const onRetryCancel = () => {
        cleanup()
      }

      const onError = (err) => {
        handleError(err)
        cleanup()
      }

      const args = [poolKey]
      writeContract({
        instance,
        methodName: 'withdrawRewards',
        onTransactionResult,
        onRetryCancel,
        onError,
        args
      })
    } catch (err) {
      handleError(err)
      cleanup()
    }
  }

  return {
    withdrawingRewards,
    handleWithdrawRewards
  }
}
