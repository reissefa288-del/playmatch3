from pathlib import Path

CONTENT = r"""import { FiHeart, FiMapPin, FiMessageCircle, FiUserPlus } from 'react-icons/fi'
import { IoShieldCheckmark } from 'react-icons/io5'
import { LuGamepad2 } from 'react-icons/lu'
import { MdEmojiEvents } from 'react-icons/md'
import { heroPlayerMeta } from '../data'
import type { FavoriteGame } from '../types'

export type HeroPlayerCardProps = {
  favoriteGames: FavoriteGame[]
  portraitImage: string
  portraitPosition?: string
}

export function HeroPlayerCard({
  favoriteGames,
  portraitImage,
  portraitPosition,
}: HeroPlayerCardProps) {
  const meta = heroPlayerMeta

  return (
    <article className="pm-hero-card">
      <motion.div className="pm-hero-card__compat-float" aria-label={`${meta.compatibility}% uyumluluk`}>
        <FiHeart />
        <span>%{meta.compatibility}</span>
        <small>Uyumluluk</small>
      </motion.div>

      <motion.div className="pm-hero-card__body">
        <motion.div className="pm-hero-card__portrait-col">
          <motion.div
            className="pm-hero-card__portrait"
            style={{
              backgroundImage: `url(${portraitImage})`,
              ...(portraitPosition ? { backgroundPosition: portraitPosition } : {}),
            }}
            role="img"
            aria-label="Zeynep"
          >
            <span className="pm-status-pill">Online</span>
          </motion.div>
        </motion.div>

        <motion.div className="pm-hero-card__content-col">
          <motion.div className="pm-hero-card__details">
            <h2>
              Zeynep <IoShieldCheckmark />
              <span>21</span>
            </h2>
            <p>
              <FiMapPin /> {meta.distance}
            </p>
            <p>
              <LuGamepad2 /> İstanbul, Türkiye
            </p>
            <p className="pm-hero-card__last-game">{meta.lastGame}</p>

            <ul className="pm-hero-card__stats">
              {meta.stats.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <motion.div className="pm-tags">
              <span>
                <LuGamepad2 /> FPS
              </span>
              <span>
                <LuGamepad2 /> Rekabetçi
              </span>
              <span>
                <MdEmojiEvents /> Platinum I
              </span>
            </motion.div>

            <h3>Favori Oyunlar</h3>
            <motion.div className="pm-favorites">
              {favoriteGames.map((game) => (
                <motion.div key={game.id} className="pm-mini-game">
                  {game.label}
                </motion.div>
              ))}
              <motion.div className="pm-mini-game muted">+3</motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="pm-hero-card__actions">
        <button className="pm-secondary" type="button">
          <FiMessageCircle /> Mesaj Gönder
        </button>
        <button className="pm-primary" type="button">
          <FiHeart /> Eşleşme isteği
        </button>
        <button className="pm-secondary is-blue" type="button">
          <FiUserPlus /> Oyuna Davet Et
        </button>
      </motion.div>
    </article>
  )
}
"""

# Replace placeholder with div (written as MOTION_DIV to avoid editor confusion)
PLACEHOLDER = "MOTION_DIV"
fixed = CONTENT.replace("motion.div", "div").replace("MOTION_DIV", "motion.div")
Path(r"c:\Users\farec\Desktop\PlayMeet\src\features\home\components\HeroPlayerCard.tsx").write_text(
    fixed, encoding="utf-8"
)
print("ok")
