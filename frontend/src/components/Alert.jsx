import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearAlert } from '../redux/store'

export default function Alert() {
  const dispatch = useDispatch()
  const { alert } = useSelector(state => state.ui)

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => dispatch(clearAlert()), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert, dispatch])

  if (!alert) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
        <div className="flex items-center gap-2">
          {alert.type === 'error' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
          )}
          <span className="font-medium text-sm">{alert.message}</span>
        </div>
        <button 
          onClick={() => dispatch(clearAlert())}
          className="absolute top-2 right-2 opacity-60 hover:opacity-100"
          aria-label="Close alert"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  )
}
