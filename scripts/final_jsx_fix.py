from pathlib import Path

BASE = Path(r"c:\Users\farec\Desktop\PlayMeet")
BC = "</" + "motion.div>"
GC = "</" + "div>"

fixes = [
    ("src/navigation/MainTabLayout.tsx", "      " + BC + "\n\n      {!hideDock", "      " + GC + "\n\n      {!hideDock"),
    ("src/navigation/AppRoutes.tsx", "    " + BC + "\n  )\n}", "    " + GC + "\n  )\n}"),
    ("src/features/chat/components/MessageThread.tsx", "    " + BC + "\n  )\n}", "    " + GC + "\n  )\n}"),
    ("src/features/chat/MessageScreen.tsx", "      " + BC + "\n    " + BC, "      " + GC + "\n    " + GC),
    ("src/features/games/components/GamesHeader.tsx", "        " + BC + "\n      </header>", "        " + GC + "\n      </header>"),
    ("src/features/match/components/MatchBoostPanel.tsx", "      " + BC + "\n    </motion.section>", "      " + GC + "\n    </motion.section>"),
    ("src/features/match/components/MatchTabs.tsx", "    " + BC + "\n  )", "    " + GC + "\n  )"),
    ("src/features/premium/components/PremiumPackages.tsx", "      " + BC + "\n\n      <p", "      " + GC + "\n\n      <p"),
]

for rel, old, new in fixes:
    p = BASE / rel
    t = p.read_text(encoding="utf-8")
    if old not in t:
        print("MISSING", rel)
        continue
    p.write_text(t.replace(old, new, 1), encoding="utf-8", newline="\n")
    print("OK", rel)
