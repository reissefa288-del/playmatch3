import '../../styles/profile-ambient.css'
import { ProfileScreenBody } from './ProfileScreenBody'
import { profileShellVars } from './profileShellTheme'

/** Sync profile — navbar + full content immediately */
export function ProfileScreen() {
  return (
    <div className="pm-app-shell pm-app-shell--profile">
      <div className="pm-artboard">
        <main className="pm-profile pm-profile--interactive" style={profileShellVars}>
          <ProfileScreenBody />
        </main>
      </div>
    </div>
  )
}
