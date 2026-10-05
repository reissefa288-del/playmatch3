import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PlayMeet render error:', error, info.componentStack)
    void import('../shared/initProductionMonitoring').then(({ reportReactError }) => {
      reportReactError(error, info.componentStack)
    })
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100svh',
            padding: 24,
            background: '#0a0e24',
            color: '#f4f6ff',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: 18, marginBottom: 12 }}>Uygulama yüklenemedi</h1>
          <pre
            style={{
              fontSize: 12,
              color: '#ffb4d8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            style={{
              marginTop: 16,
              padding: '10px 16px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(90deg, #ff4ec8, #5b8cff)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            Sayfayı yenile
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
