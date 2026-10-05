import '../../styles/profile-bundle.css'
import { LcpImagePreload } from '../../shared/LcpImagePreload'
import { PictureImage } from '../../shared/PictureImage'
import { Navbar } from '../home/components/Navbar'
import { profileLcpPortrait } from './profileLcpPortrait'

/** P7 — sync shell: LCP portrait + navbar; hero placeholder defers to body */
export function ProfileScreenShell({ showLcpHero = true }: { showLcpHero?: boolean }) {
  return (
    <>
      <LcpImagePreload avif={profileLcpPortrait.avif} webp={profileLcpPortrait.webp} />
      <Navbar />
      {showLcpHero ? (
        <section className="pm-profile-hero-card" aria-label="Profil kartı">
          <div className="pm-profile-hero-card__stage">
            <PictureImage
              webp={profileLcpPortrait.webp}
              avif={profileLcpPortrait.avif}
              alt=""
              className="pm-profile-hero-card__portrait"
              width={390}
              height={520}
              priority
            />
            <div className="pm-profile-hero-card__shade" aria-hidden />
          </div>
        </section>
      ) : null}
    </>
  )
}
