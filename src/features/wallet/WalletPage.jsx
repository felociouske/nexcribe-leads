import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { usersAPI, paymentsAPI } from '@/api/endpoints'
import { fmtUSD, fmtKES, fmtRelative, getErrorMessage, STATUS_BADGES } from '@/utils'
import { PageSpinner } from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07 },
})

// ── Wallet card ──────────────────────────────────────────────────────────────
function WalletCard({ label, icon, balance_usd, balance_kes, meta, color, onAction, actionLabel, actionDisabled }) {
  const styles = {
    teal:  'border-teal-200 bg-gradient-to-br from-white to-teal-50/50',
    navy:  'border-navy-200 bg-gradient-to-br from-white to-navy-50/30',
    coral: 'border-coral-200 bg-gradient-to-br from-white to-coral-50/50',
    green: 'border-green-200 bg-gradient-to-br from-white to-green-50/50',
  }
  const amtColors = {
    teal: 'text-teal-700', navy: 'text-navy-800', coral: 'text-coral-700', green: 'text-green-700',
  }
  const btnStyles = {
    teal:  'bg-teal-600 hover:bg-teal-500 text-white',
    navy:  'bg-navy-700 hover:bg-navy-600 text-white',
    coral: 'bg-coral-500 hover:bg-coral-400 text-white',
    green: 'bg-green-600 hover:bg-green-500 text-white',
  }

  return (
    <div className={`card border ${styles[color] || styles.teal} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-display font-semibold text-navy-600 text-sm uppercase tracking-wider">{label}</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400" title="Active" />
      </div>
      <div className="border-t border-dashed border-navy-200 pt-4 mb-4">
        <p className="text-navy-400 text-xs uppercase tracking-widest mb-1">Available Balance</p>
        <p className={`font-display text-3xl font-bold ${amtColors[color] || amtColors.teal}`}>
          {fmtUSD(balance_usd)}
        </p>
        <p className="text-navy-400 text-xs mt-0.5">{fmtKES(balance_kes)}</p>
      </div>
      {meta && meta.length > 0 && (
        <div className="border-t border-navy-100 pt-3 mb-4 space-y-1.5">
          {meta.map(({ key, val }) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-navy-400">{key}</span>
              <span className="font-display font-semibold text-navy-600">{val}</span>
            </div>
          ))}
        </div>
      )}
      {onAction && (
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className={`w-full py-2.5 rounded-xl text-sm font-display font-semibold transition-all
            disabled:opacity-40 disabled:cursor-not-allowed ${btnStyles[color] || btnStyles.teal}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WalletPage() {
  const qc = useQueryClient()
  const [depositModal, setDepositModal] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')

  const depositForm = useForm()
  const withdrawForm = useForm()
  const withdrawMethod = withdrawForm.watch('method', 'MPESA')

  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ['ref-wallets'],
    queryFn: () => usersAPI.getWallets().then(r => r.data),
    staleTime: 0,
    refetchInterval: 30000,
  })

  const { data: txnData } = useQuery({
    queryKey: ['ref-transactions'],
    queryFn: () => usersAPI.getTransactions({ page_size: 20 }).then(r => r.data),
    staleTime: 0,
  })

  const { data: deposits } = useQuery({
    queryKey: ['ref-deposits'],
    queryFn: () => paymentsAPI.getDeposits().then(r => r.data),
    enabled: activeTab === 'deposits',
    staleTime: 0,
  })

  const { data: withdrawals } = useQuery({
    queryKey: ['ref-withdrawals'],
    queryFn: () => paymentsAPI.getWithdrawals().then(r => r.data),
    enabled: activeTab === 'withdrawals',
    staleTime: 0,
  })

  const { data: mpesaDetails } = useQuery({
    queryKey: ['ref-mpesa-details'],
    queryFn: () => paymentsAPI.getMpesaDetails().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const deposit = useMutation({
    mutationFn: (data) => paymentsAPI.requestDeposit(data),
    onSuccess: (res) => {
      toast.success(`Deposit submitted! Txn: ${res.data.transaction_code}`)
      qc.invalidateQueries({ queryKey: ['ref-deposits'] })
      qc.invalidateQueries({ queryKey: ['ref-wallets'] })
      setDepositModal(false)
      depositForm.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const withdraw = useMutation({
    mutationFn: (data) => paymentsAPI.requestWithdrawal(data),
    onSuccess: (res) => {
      toast.success(`Withdrawal submitted! Txn: ${res.data.transaction_code}`)
      qc.invalidateQueries({ queryKey: ['ref-wallets'] })
      qc.invalidateQueries({ queryKey: ['ref-withdrawals'] })
      setWithdrawModal(false)
      withdrawForm.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (walletsLoading) return <PageSpinner />

  const aw = wallets?.account_wallet
  const dw = wallets?.deposit_wallet
  const cw = wallets?.cashback_wallet
  const txns = txnData?.results || []
  const deps = deposits?.results || []
  const wds  = withdrawals?.results || []

  const TABS = ['transactions', 'deposits', 'withdrawals']

  return (
    <div className="page">
      <motion.div {...fade(0)} className="mb-6">
        <h1 className="section-title">My Wallet</h1>
        <p className="section-subtitle">All your balances, deposits, and withdrawals in one place.</p>
      </motion.div>

      {/* Wallet cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <motion.div {...fade(1)}>
          <WalletCard
            label="Account" icon="💼" color="teal"
            balance_usd={aw?.balance_usd} balance_kes={aw?.balance_kes}
            meta={[{ key: 'Total earned', val: fmtUSD(aw?.total_earned_usd) }]}
            onAction={() => setWithdrawModal(true)}
            actionLabel="Withdraw"
            actionDisabled={parseFloat(aw?.balance_usd || 0) < 2}
          />
        </motion.div>
        <motion.div {...fade(2)}>
          <WalletCard
            label="Deposit" icon="🏦" color="coral"
            balance_usd={dw?.balance_usd} balance_kes={dw?.balance_kes}
            meta={[{ key: 'Total deposited', val: fmtUSD(dw?.total_deposited_usd) }]}
            onAction={() => setDepositModal(true)}
            actionLabel="Deposit via M-Pesa"
          />
        </motion.div>
        <motion.div {...fade(3)}>
          <WalletCard
            label="Extras" icon="🎁" color="green"
            balance_usd={cw?.balance_usd} balance_kes={cw?.balance_kes}
            meta={[{ key: 'Bonuses & cashback', val: fmtUSD(cw?.total_earned_usd) }]}
          />
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div {...fade(4)}>
        <div className="flex gap-2 mb-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-display font-semibold capitalize transition-all ${
                activeTab === t ? 'bg-teal-600 text-white' : 'bg-white border border-navy-200 text-navy-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {activeTab === 'transactions' && (
          <div className="card overflow-hidden">
            {txns.length === 0 ? (
              <EmptyState icon="💳" title="No transactions yet" desc="Make a deposit to get started." />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Code</th><th>Description</th><th>Type</th>
                    <th className="text-right">Amount</th><th className="text-right">When</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map(t => (
                    <tr key={t.id}>
                      <td><span className="txn-code">{t.transaction_code}</span></td>
                      <td className="max-w-[200px] truncate text-navy-600 text-sm">{t.description}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGES[t.type] || 'badge-navy'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`text-right font-display font-bold text-sm ${
                        t.type === 'CREDIT' ? 'text-teal-600' : 'text-red-500'
                      }`}>
                        {t.type === 'CREDIT' ? '+' : '-'}{fmtUSD(t.amount_usd)}
                      </td>
                      <td className="text-right text-navy-400 text-xs">{fmtRelative(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Deposits */}
        {activeTab === 'deposits' && (
          <div className="card overflow-hidden">
            {deps.length === 0 ? (
              <EmptyState icon="🏦" title="No deposits yet"
                desc="Click 'Deposit via M-Pesa' above to fund your account." />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Code</th><th>M-Pesa Code</th><th>Status</th>
                    <th className="text-right">Amount (KES)</th><th className="text-right">When</th>
                  </tr>
                </thead>
                <tbody>
                  {deps.map(d => (
                    <tr key={d.id}>
                      <td><span className="txn-code">{d.transaction_code}</span></td>
                      <td className="font-mono text-sm">{d.mpesa_code}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGES[d.status] || 'badge-navy'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="text-right font-display font-semibold">{fmtKES(d.amount_kes)}</td>
                      <td className="text-right text-navy-400 text-xs">{fmtRelative(d.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Withdrawals */}
        {activeTab === 'withdrawals' && (
          <div className="card overflow-hidden">
            {wds.length === 0 ? (
              <EmptyState icon="💸" title="No withdrawals yet"
                desc="Minimum withdrawal is $2.00 from your Account Wallet." />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Code</th><th>Method</th><th>Status</th>
                    <th className="text-right">Amount</th><th className="text-right">When</th>
                  </tr>
                </thead>
                <tbody>
                  {wds.map(w => (
                    <tr key={w.id}>
                      <td><span className="txn-code">{w.transaction_code}</span></td>
                      <td className="text-sm">{w.method}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGES[w.status] || 'badge-navy'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="text-right font-display font-semibold">{fmtUSD(w.amount_usd)}</td>
                      <td className="text-right text-navy-400 text-xs">{fmtRelative(w.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Deposit Modal ── */}
      <Modal open={depositModal} onClose={() => { setDepositModal(false); depositForm.reset() }} title="Submit M-Pesa Deposit">
        <form onSubmit={depositForm.handleSubmit((d) => deposit.mutate({
          mpesa_code: d.mpesa_code.trim().toUpperCase(),
          phone_number: d.phone_number.trim(),
          amount_kes: parseFloat(d.amount_kes),
        }))} className="space-y-4">
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-700 space-y-1">
            <p className="font-semibold">How to deposit:</p>
            <ol className="space-y-1 list-decimal list-inside text-teal-700">
              <li>Send money via M-Pesa to <strong>{mpesaDetails?.phone_number || '...'} ({mpesaDetails?.account_name || '...'})</strong></li>
              <li>Copy the M-Pesa confirmation code</li>
              <li>Fill in this form and submit</li>
              <li>Admin approves within 5–10 minutes</li>
            </ol>
          </div>
          <div>
            <label className="label">M-Pesa code</label>
            <input {...depositForm.register('mpesa_code', { required: 'Required' })}
              placeholder="e.g. QJK2ABC123" className="input font-mono uppercase tracking-wider" />
            {depositForm.formState.errors.mpesa_code && (
              <p className="text-red-500 text-xs mt-1">{depositForm.formState.errors.mpesa_code.message}</p>
            )}
          </div>
          <div>
            <label className="label">Phone number used</label>
            <input {...depositForm.register('phone_number', { required: 'Required' })}
              placeholder="+254 700 000 000" className="input" />
          </div>
          <div>
            <label className="label">Amount (KES)</label>
            <input {...depositForm.register('amount_kes', {
              required: 'Required', min: { value: 100, message: 'Min KES 100' },
            })} type="number" placeholder="e.g. 1500" className="input" />
            <p className="text-navy-400 text-xs mt-1">$1 = KES 120</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setDepositModal(false); depositForm.reset() }}
              className="btn-ghost flex-1 border border-navy-200">Cancel</button>
            <button type="submit" disabled={deposit.isPending} className="btn-primary flex-1">
              {deposit.isPending ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal open={withdrawModal} onClose={() => { setWithdrawModal(false); withdrawForm.reset() }} title="Withdraw Funds">
        <form onSubmit={withdrawForm.handleSubmit((d) => withdraw.mutate({
          ...d, wallet_type: 'ACCOUNT', amount_usd: parseFloat(d.amount_usd),
        }))} className="space-y-4">
          <div className="bg-navy-50 rounded-xl p-4 flex items-center justify-between">
            <p className="text-navy-600 text-sm">Available balance</p>
            <p className="font-display font-bold text-teal-600 text-lg">{fmtUSD(aw?.balance_usd)}</p>
          </div>
          <div>
            <label className="label">Amount (USD)</label>
            <input {...withdrawForm.register('amount_usd', {
              required: 'Required', min: { value: 2, message: 'Minimum $2' },
            })} type="number" step="0.01" placeholder="e.g. 5.00" className="input" />
          </div>
          <div>
            <label className="label">Method</label>
            <div className="flex gap-3">
              {['MPESA', 'CARD'].map(m => (
                <label key={m} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                  border-2 cursor-pointer text-sm font-semibold transition-all ${
                  withdrawMethod === m ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-navy-200 text-navy-500'
                }`}>
                  <input {...withdrawForm.register('method')} type="radio" value={m}
                    className="hidden" defaultChecked={m === 'MPESA'} />
                  {m === 'MPESA' ? '📱 M-Pesa' : '💳 Card'}
                </label>
              ))}
            </div>
          </div>
          {withdrawMethod === 'MPESA' && (
            <div>
              <label className="label">M-Pesa phone number</label>
              <input {...withdrawForm.register('phone_number', { required: 'Required' })}
                placeholder="+254 700 000 000" className="input" />
            </div>
          )}
          {withdrawMethod === 'CARD' && (
            <div>
              <label className="label">Account details</label>
              <input {...withdrawForm.register('account_details', { required: 'Required' })}
                placeholder="Card or account info" className="input" />
            </div>
          )}
          <p className="text-navy-400 text-xs">Processing within 24 hours. Rate: $1 = KES 120.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setWithdrawModal(false); withdrawForm.reset() }}
              className="btn-ghost flex-1 border border-navy-200">Cancel</button>
            <button type="submit" disabled={withdraw.isPending} className="btn-primary flex-1">
              {withdraw.isPending ? 'Submitting…' : 'Request Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}