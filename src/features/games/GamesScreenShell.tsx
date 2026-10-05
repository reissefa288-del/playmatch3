import { LcpImagePreload } from '../../shared/LcpImagePreload'
import { PictureImage } from '../../shared/PictureImage'
import { Navbar } from '../home/components/Navbar'
import { gamesLcpArt } from './gamesLcpArt'

/** P6 — sync shell: LCP hero + navbar only; stats/catalog defer to GamesScreenBody */
export function GamesScreenShell() {
  return (
    <>
      <LcpImagePreload avif={gamesLcpArt.avif} webp={gamesLcpArt.webp} />
      <Navbar />
      <div className="pm-games-hero-block">
        <section className="pm-games-hero">
          <PictureImage
            webp={gamesLcpArt.webp}
            avif={gamesLcpArt.avif}
            alt=""
            className="pm-games-hero__lcp"
            width={358}
            height={196}
            priority
          />
        </section>
      </div>
    </>
  )
}
