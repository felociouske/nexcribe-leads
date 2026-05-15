export default function EmptyState({ icon = '◎', title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="font-display font-bold text-navy-800 mb-1">{title}</h3>
      {desc && <p className="text-navy-500 text-sm max-w-xs">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}