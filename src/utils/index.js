import { format, formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export { clsx }
export const cn = (...args) => clsx(args)

export const fmtUSD = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0)

export const fmtKES = (val) =>
  `KES ${new Intl.NumberFormat('en-KE').format(val ?? 0)}`

export const fmtDate = (d) => {
  if (!d) return '—'
  return format(new Date(d), 'dd MMM yyyy')
}

export const fmtRelative = (d) => {
  if (!d) return '—'
  return formatDistanceToNow(new Date(d), { addSuffix: true })
}

export const getErrorMessage = (err) => {
  if (!err?.response?.data) return err?.message || 'Something went wrong.'
  const d = err.response.data
  if (typeof d === 'string') return d
  if (d.detail) return d.detail
  if (d.non_field_errors) return d.non_field_errors.join(' ')
  const first = Object.values(d)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return 'Something went wrong.'
}

export const STATUS_BADGES = {
  PENDING:   'badge-amber',
  APPROVED:  'badge-green',
  COMPLETED: 'badge-green',
  REJECTED:  'badge-red',
  ACTIVE:    'badge-teal',
  CREDIT:    'badge-green',
  DEBIT:     'badge-red',
}