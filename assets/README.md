# Portfolio project media

## Ocelový duel refresh (2026-10-08)

The Iron Duel showcase now reflects `/home/michal/ocelovyduel` at Git revision
`76ecc8fee6f6136f1bb973a5702ba7e8dcaf14bc` (C++17 / SDL2). The current `src`,
`include`, `CMakeLists.txt`, and `docs` match that revision. The working tree also
contains unrelated legacy-file deletions; this is not a claim that it is clean.
No application source files were changed for this refresh.

| Asset | Source and capture |
| --- | --- |
| `iron-duel-demo.mp4` | Current `docs/gameplay.mp4`, remuxed with MP4 fast-start metadata and no re-encoding. H.264, 1068 × 600, 20 fps, 30 seconds, no audio. Replaces the earlier SDL recording. |
| `iron-duel.webp` | Current `docs/gameplay.png`, 1067 × 600; actual game renderer showing a shot impact. Replaces the old poster. |
| `iron-duel-ai.webp` | Current `program` binary, seed 42, two AI players, normal difficulty; F1 candidate-trajectory overlay at smoke frame 28. Actual SDL2 rendering at 1067 × 600. |
| `iron-duel-sample.odr` | A freshly recorded one-round, two-player AI match with seed 42 and normal difficulty. Re-verified using the same binary; one checkpoint, final state hash `1296834004986104171`. |

Both WebP images use FFmpeg `libwebp`, quality 92, at original dimensions without
cropping or compositing. The AI screenshot used the native smoke-input interface:
`0 press Return`, then `1 press F1`, with `--humans 0 --smoke 28`,
`SDL_VIDEODRIVER=dummy`, and `SDL_RENDER_DRIVER=software`.

The sample was recorded with `--headless --seed 42 --players 2 --rounds 1
--difficulty normal --record FILE`. The transcript on the page reproduces the
output of `--verify iron-duel-sample.odr` (with a portable executable path).
Replay repeatability is scoped to the same build, not guaranteed across platforms.

Source video SHA-256: `8018bb52e51f06caa2a90d0b84194b7da40eaf53fc4fb4dcc56fd64d11fe7513`.
Capture and replay binary SHA-256: `be34c7f306d1f268e11c37d7c0449cac748f2e4a58ebc83b93f9487558db0ca2`.

## Chess and Komplex captures (2026-10-07)

These captures show the actual current local applications. No application source files were changed. They are screenshots and a recorded protocol transcript, not applications running in the visitor's browser.

| Asset | Source | Capture |
| --- | --- | --- |
| `chess-current.webp` | `/home/michal/chess`, clean Git revision `0a93106b4e8a1af6316d07c4676953f42425a231` | 1920 × 1080, actual SDL renderer after the legal sequence `e2e4 e7e5 g1f3 b8c6 f1c4 g8f6`. |
| `chess-uci-session.txt` | Same revision, existing `program-uci` binary | Actual UCI handshake and depth-5 search, one worker, opening book disabled, same opening position. Timing and node counts describe this one run only. |
| `komplex-mandelbrot.webp` | `/home/michal/Documents/komplex`, current Qt 6 application | 1400 × 860, Mandelbrot with English beginner lesson. |
| `komplex-julia.webp` | Same local Komplex source | 1400 × 860, Julia default spiral parameters and visible parameter controls. |
| `komplex-lessons.webp` | Same local Komplex source | 1400 × 860, Burning Ship with Czech mathematics lesson. |

The local Komplex directory has no Git metadata. Its source snapshot is recorded in `komplex-source.sha256`; the SHA-256 of that manifest is `3a9515d68b6a4c526798afad6b09e51002535315c12a2608d49324fe020e4aaf`. This identifies the local source without implying the public repository already contains the same revision.

### Capture method

- Komplex: a temporary C++ harness linked the current application's `fractal_ui` and `fractal_core` libraries. It created the unchanged `Window`, selected the existing `fractalList` and `lessonTabs` controls, and used `QWidget::grab()` after each full-resolution render completed. `QT_QPA_PLATFORM=offscreen` and a temporary `XDG_CONFIG_HOME` kept the captures independent of desktop state and personal preferences.
- Chess: a temporary copy of `main.cpp` applied the six opening moves after verifying each against `generujTahy`, then saved the existing SDL video surface with `SDL_SaveBMP`. It linked the current engine and graphics object files and ran under `SDL_VIDEODRIVER=dummy`. The game's actual board, pieces, menus, and evaluation display were preserved.
- UCI: a Python subprocess sent `uci`, disabled the opening book, chose one worker, sent `isready`, loaded the position, and waited for the completed depth-5 `bestmove` response before quitting. Input lines are prefixed with `>`; output lines are unchanged. The portfolio displays selected lines and offers the complete transcript.
- Screenshot encoding: FFmpeg `libwebp`, quality 92, original dimensions, no cropping or compositing.

Offscreen capture verifies the actual application rendering and input state shown here. It is not a claim about external chess-GUI integration or desktop display-server behaviour.

## Earlier recordings

These silent MP4 clips were recorded from the actual SDL applications using scripted demo inputs in temporary copies of their source. The originals were not changed.

| Clip | Source revision | Recorded action | Current use |
| --- | --- | --- | --- |
| `chess-demo.mp4` | [misa-stack/chess](https://github.com/misa-stack/chess/tree/ac726f4b2aba544c157eae7bfd15a51e008af0cc) | White plays e4, Nf3, and Bc4 against the computer. | Retained as an older asset; replaced on the site by current captures. |
| `komplex-demo.mp4` | [misa-stack/Komplex](https://github.com/misa-stack/Komplex/tree/a7a5073da93bb4ce7d927f352366c072ee6c5b4e) | Mandelbrot zoom in the earlier SDL renderer. | Retained as an older asset; replaced on the site by current Qt 6 captures. |

These earlier Chess and Komplex clips use H.264, 1200 × 676, 30 fps, no audio,
and MP4 fast-start metadata. The earlier Iron Duel clip from revision
`54317782f12a22142cc155b4ced401faaf5018b2` was replaced on 2026-10-08 as described above.
