import type { McNode } from '../utils/missileCommandDuelEngine'

type Props = {
  nodes: McNode[]
  variant: 'p1' | 'p2'
}

export function RiftWardNexusBar({ nodes, variant }: Props) {
  const alive = nodes.filter((n) => n.alive).length

  return (
    <div className={['pm-rw-nexus-bar', `is-${variant}`, alive <= 2 ? 'is-critical' : ''].filter(Boolean).join(' ')} aria-label={`Nexus ${alive}/${nodes.length}`}>
      {nodes.map((n) => (
        <span
          key={n.id}
          className={['pm-rw-nexus-bar__pip', n.alive ? 'is-on' : 'is-off'].filter(Boolean).join(' ')}
          aria-hidden
        />
      ))}
    </div>
  )
}
