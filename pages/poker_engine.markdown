---
layout: page
title: "Building a GTO Solver"
permalink: /projects/poker_engine/
---

<style>
  .we {
    --we-border: #e8e8e8;
    --we-grey: #828282;
    --we-grey-dark: #424242;
    --we-ink: #111;
    --we-blue: #2a7ae2;
    --we-panel: #f7f7f7;
  }
  .we .we-lede {
    font-size: 1.05em;
    color: var(--we-grey-dark);
  }
  .we .we-kicker {
    display: block;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--we-grey);
    margin-bottom: 4px;
  }
  .we h2 {
    margin-top: 1.8em;
    padding-top: 1.2em;
    border-top: 1px solid var(--we-border);
  }
  .we h3 {
    font-size: 1.05em;
    margin-top: 1.4em;
    margin-bottom: 0.3em;
  }
  .we .we-toc {
    border: 1px solid var(--we-border);
    border-radius: 8px;
    padding: 18px 22px;
    margin: 1.5em 0;
    font-size: 0.95em;
  }
  .we .we-toc ol {
    margin: 0;
    padding-left: 1.3em;
  }
  .we figure {
    margin: 1.5em 0;
    border: 1px solid var(--we-border);
    border-radius: 8px;
    overflow: hidden;
  }
  .we figure img {
    display: block;
    width: 100%;
    height: auto;
  }
  .we figcaption {
    padding: 10px 16px;
    background: var(--we-panel);
    border-top: 1px solid var(--we-border);
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--we-grey);
  }
  .we .we-callout {
    border: 1px solid var(--we-border);
    border-radius: 8px;
    background: var(--we-panel);
    padding: 16px 20px;
    margin: 1.5em 0;
  }
  .we .we-callout.win { border-color: #a7f3d0; background: #f0fdf6; }
  .we .we-callout.loss { border-color: #fecdd3; background: #fff5f6; }
  .we .we-callout .we-callout-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: var(--we-grey-dark);
    margin-bottom: 6px;
  }
  .we .we-callout p { margin-bottom: 0.6em; font-size: 0.95em; }
  .we .we-callout p:last-child { margin-bottom: 0; }
  .we .we-figbox {
    border: 1px solid var(--we-border);
    border-radius: 8px;
    background: var(--we-panel);
    padding: 20px;
    margin: 1.5em 0;
    overflow-x: auto;
  }
  .we .we-figbox svg { display: block; margin: 0 auto; max-width: 100%; height: auto; }
  .we .we-note {
    margin-top: 12px;
    text-align: center;
    font-size: 11px;
    color: var(--we-grey);
  }
  .we .we-ladder { display: flex; gap: 8px; align-items: stretch; min-width: 560px; }
  .we .we-ladder .rung {
    flex: 1;
    border: 1px solid var(--we-border);
    border-radius: 8px;
    background: #fff;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .we .we-ladder .rung .t { font-size: 12px; font-weight: 600; color: var(--we-ink); }
  .we .we-ladder .rung .d { font-size: 10.5px; line-height: 1.35; color: var(--we-grey); }
  .we .we-ladder .rung .g { font-size: 9.5px; font-weight: 600; letter-spacing: 0.3px; color: var(--we-blue); margin-top: auto; }
  .we .we-ladder .arr { align-self: center; color: #ccc; }
  .we .we-flow { max-width: 460px; margin: 0 auto; }
  .we .we-flow .box {
    border: 1px solid var(--we-border);
    border-radius: 8px;
    background: #fff;
    padding: 14px 16px;
  }
  .we .we-flow .box.dashed { border-style: dashed; background: transparent; }
  .we .we-flow .box .t { font-size: 13px; font-weight: 600; color: var(--we-ink); }
  .we .we-flow .box .d { font-size: 11.5px; line-height: 1.5; color: var(--we-grey); margin-top: 3px; }
  .we .we-flow .down { text-align: center; color: #ccc; padding: 5px 0; }
  .we .we-bars { min-width: 420px; display: flex; flex-direction: column; gap: 18px; }
  .we .we-bars .row .lbl { display: flex; justify-content: space-between; gap: 16px; font-size: 12.5px; margin-bottom: 5px; }
  .we .we-bars .row .lbl b { color: var(--we-ink); white-space: nowrap; }
  .we .we-bars .row .track { height: 10px; border-radius: 999px; background: #e5e5e5; overflow: hidden; }
  .we .we-bars .row .fill { height: 100%; border-radius: 999px; background: var(--we-blue); }
  .we .we-bars .row .sub { text-align: right; font-size: 10.5px; color: var(--we-grey); margin-top: 4px; }
  .we .we-refs { display: grid; gap: 28px; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .we .we-refs { grid-template-columns: 1fr 1fr; } }
  .we .we-refs h4 {
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--we-grey);
    margin: 0 0 12px;
  }
  .we .we-refs ul { list-style: none; margin: 0; padding: 0; }
  .we .we-refs li { margin-bottom: 16px; font-size: 13px; }
  .we .we-refs li .m { display: block; color: var(--we-grey); font-size: 12px; }
</style>

<div class="we" markdown="1">

<span class="we-kicker">Project Writeup</span>

This app is powered by a **CFR-D solver**: a game-tree search algorithm backed by a trained
neural network. This page is the short version of how it was built — the algorithm, the central
design bet, how the network's architecture evolved, and what it actually trains on.
{: .we-lede }

The solver is served through a Next.js study tool — configure a scenario, solve it, and click
through the resulting strategy street by street. Source and full technical docs live in the
project repo.

<figure>
  <img src="{{ '/assets/poker_engine/strategy.png' | relative_url }}" alt="The study tool showing a solved flop strategy: color-coded action grids for both ranges, a range summary and per-action EV panel on the right, and the decision tree in the top-left.">
  <figcaption>A real solve, rendered in the app: green/red/orange squares are check/raise/all-in frequency by hand, and the right rail breaks the same node down by action EV and hand class.</figcaption>
</figure>

<div class="we-toc" markdown="1">
1. [The problem, and CFR-D](#the-problem-and-cfr-d)
2. [Predict EV, not CFV](#predict-ev-not-cfv)
3. [Five architectures, chasing the residual](#five-architectures-chasing-the-residual)
4. [How the training data works](#how-the-training-data-works)
5. [The multi-street puzzle](#the-multi-street-puzzle)
6. [Making it fast enough to be a web app](#making-it-fast-enough-to-be-a-web-app)
7. [Where things stand](#where-things-stand)
8. [References](#references)
</div>

## The problem, and CFR-D

No-Limit Hold'em's game tree is too large to solve exactly — every community card and every bet
size multiplies it further. The standard algorithm for imperfect-information games,
**CFR (Counterfactual Regret Minimization)**, converges to a Nash equilibrium by having two
virtual copies of the game repeatedly play each other and accumulate "regret" for each action —
but only if you can afford to run it over the whole tree. Past a couple of streets at a full
52-card deck, you can't.

This project follows the **DeepStack / ReBeL** answer, adapted as **CFR-D** (CFR–Decomposed):
solve a shallow **trunk** of the tree exactly with real CFR, and at a depth limit — a chance
node, like the turn or river card being dealt — hand off to a **trained neural network** that
estimates the value of everything below it, instead of solving it out.

<div class="we-figbox">
  <svg viewBox="0 0 700 280" role="img" aria-label="Diagram of CFR-D: a shallow trunk of check, bet, and raise decisions solved exactly by CFR, which at a depth limit hands off to a neural network that estimates the value of the entire subgame below.">
    <defs>
      <marker id="we-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill="#a3a3a3" />
      </marker>
    </defs>
    <circle cx="350" cy="26" r="5" fill="#262626" />
    <text x="350" y="15" text-anchor="middle" fill="#737373" font-size="11">flop decision</text>
    <line x1="350" y1="31" x2="180" y2="86" stroke="#a3a3a3" stroke-width="1.5" marker-end="url(#we-arrow)" />
    <line x1="350" y1="31" x2="350" y2="86" stroke="#a3a3a3" stroke-width="1.5" marker-end="url(#we-arrow)" />
    <line x1="350" y1="31" x2="520" y2="86" stroke="#a3a3a3" stroke-width="1.5" marker-end="url(#we-arrow)" />
    <g font-size="11" font-weight="500" fill="#525252" text-anchor="middle">
      <circle cx="180" cy="92" r="5" fill="#3b82f6" />
      <text x="180" y="112">CHECK</text>
      <line x1="180" y1="97" x2="180" y2="152" stroke="#d4d4d4" stroke-width="1.5" />
      <circle cx="350" cy="92" r="5" fill="#3b82f6" />
      <text x="350" y="112">BET</text>
      <line x1="350" y1="97" x2="350" y2="152" stroke="#d4d4d4" stroke-width="1.5" />
      <circle cx="520" cy="92" r="5" fill="#3b82f6" />
      <text x="520" y="112">RAISE</text>
      <line x1="520" y1="97" x2="520" y2="152" stroke="#d4d4d4" stroke-width="1.5" />
    </g>
    <line x1="40" y1="152" x2="660" y2="152" stroke-dasharray="4 4" stroke="#a3a3a3" stroke-width="1.5" />
    <text x="660" y="146" text-anchor="end" fill="#a3a3a3" font-size="10">DEPTH LIMIT — next card to come</text>
    <rect x="90" y="166" width="520" height="88" rx="10" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1.5" />
    <g stroke="#a7f3d0" stroke-width="1">
      <line x1="130" y1="178" x2="110" y2="248" />
      <line x1="175" y1="178" x2="155" y2="248" />
      <line x1="220" y1="178" x2="200" y2="248" />
      <line x1="265" y1="178" x2="245" y2="248" />
      <line x1="310" y1="178" x2="290" y2="248" />
      <line x1="355" y1="178" x2="335" y2="248" />
      <line x1="400" y1="178" x2="380" y2="248" />
      <line x1="445" y1="178" x2="425" y2="248" />
      <line x1="490" y1="178" x2="470" y2="248" />
    </g>
    <text x="350" y="203" text-anchor="middle" fill="#065f46" font-size="13" font-weight="600">NEURAL NETWORK</text>
    <text x="350" y="221" text-anchor="middle" fill="#047857" font-size="10.5" opacity="0.85">one forward pass estimates every hand's value for the whole subgame below —</text>
    <text x="350" y="235" text-anchor="middle" fill="#047857" font-size="10.5" opacity="0.85">instead of solving it out with real CFR</text>
    <line x1="350" y1="166" x2="350" y2="99" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#we-arrow)" />
    <text x="364" y="135" fill="#059669" font-size="10">value returned</text>
  </svg>
  <div class="we-note">Real CFR runs on the trunk, above the dashed line. At the depth limit the network stands in for the entire subgame below, in one forward pass.</div>
</div>

The network's input is a **public belief state (PBS)**: the board plus both players' probability
distribution over their hole cards. Its output is a **counterfactual value (CFV)** for each of
the 1,326 possible hands, for both players — trained on millions of these situations, each
labeled by an exact CFR solve. Iterating is far cheaper on smaller decks, so a deck-size ladder
(`reduced_10` → `reduced_28` → `standard_52`) develops ideas cheaply before the real, expensive
target.

<figure>
  <img src="{{ '/assets/poker_engine/setup.png' | relative_url }}" alt="The scenario setup page: a board-card picker, editable OOP and IP range grids with preset buttons, pot/stack contribution inputs, and an iteration count and engine choice before solving.">
  <figcaption>What a PBS looks like as an input form: pick the board, shape both ranges, set the pot and stacks — this is the scenario the trunk actually solves from.</figcaption>
</figure>

## Predict EV, not CFV

The obvious approach — train the network to directly regress each hand's CFV — wastes capacity
on a part of the problem that doesn't need learning. A CFV decomposes as `CFV = matchup × EV`,
where **matchup** (the card-removal overlap between a hand and the opponent's range) is exactly
computable in closed form. So the deployed target is **EV alone**, pot-normalized; the C++
serving code reconstructs the real CFV afterward by multiplying back through the matchup and the
pot. Isolated, this was worth **−10%** exploitability; packaged with related choices, **−23%** —
and unusually, it improved both the value fit *and* downstream strategy accuracy at once.

The same logic shaped the inputs. The single biggest win was **equity-vs-range**: each hand's
showdown equity against the opponent's actual range, computed once and handed to the network
instead of left for it to infer from raw cards — **−24%** exploitability, and removing it later
cost **+23%** back. Richer scalar context (rank-in-range, opponent equity histograms,
blocker-quality features) was consistently a wash: per-combo scalars had hit a ceiling. The
residual needed an architecture that could reason about the whole range jointly, not another
input — the subject of the next section.

<div class="we-callout win" markdown="1">
<div class="we-callout-title">THE PATTERN THIS IS ONE INSTANCE OF</div>

This project's most repeated lesson: **information beats capacity**. The durable wins — matchup,
equity-vs-range, and a free **−22%** post-hoc **zero-sum correction** (the two players'
range-weighted values must sum to zero, so projecting onto that constraint at inference time
costs nothing) — all handed the network a quantity it could compute, instead of a quantity it
had to learn.
</div>

## Five architectures, chasing the residual

Once the inputs above plateaued, the network itself went through five architecture generations,
each fixing a specific failure of the last.

### Flat MLP → combo self-attention

A flat feed-forward network can't model relationships *between* hands, so it over-polarizes. Full
self-attention across all 1,326 hand tokens fixed that — but overfit: one board's exploitability
blew up **+508%**. Shrinking the same idea down (fewer, narrower blocks) regularized it into a
real win.

### DeepSets — and its blind spot

Full pairwise attention is `O(C²)`; DeepSets replaced it with an `O(C)` masked-mean pool and won
outright (**−21%**) — until a rare nut-straight hand class exposed the failure mode: a pooled
average can't represent a hand's dependence on exactly which other combos are in the range.

### ISAB Set Transformer — the deployed architecture, for months

**Inducing-point attention** restores real pairwise routing through a small set of learned
latents (`O(C·m)`, not `O(C²)`), fixing DeepSets' blind spot and becoming a new best:
**1.06×** the theoretical CFR floor at ~145k parameters. (A plateau on one architecture family
isn't a plateau on the problem — this found another 26–31% right after DeepSets looked "spent.")

### K-token — dropping the per-combo cost outright

Every architecture so far still paid for `C` per-combo tokens somewhere. A pre-test found that
collapsing the deployed network's own output onto `K = 64` equity buckets cost under 1% — so
**K-token** attends over 64 learned bucket tokens instead of 1,326 combo tokens, the first
architecture whose cost doesn't scale with deck size. It matches the per-combo network's accuracy
at roughly **10×** the forward speed, and is the current production turn *and* river network.

<div class="we-figbox">
  <div class="we-flow">
    <div class="box"><div class="t">Input PBS</div><div class="d">board one-hot (52) · K=64 pooled bucket features (mass, mean equity, width, count — not 1,326 per-combo rows) · committed</div></div>
    <div class="down">↓</div>
    <div class="box"><div class="t">K = 64 bucket tokens</div><div class="d">combos are pre-grouped into 64 equal-count equity buckets, cached per board; each bucket gets one learned token, seeded by its pooled features</div></div>
    <div class="down">↓</div>
    <div class="box"><div class="t">Board cross-attention</div><div class="d">the only route board texture reaches a bucket — buckets carry no cards of their own</div></div>
    <div class="down">↓</div>
    <div class="box"><div class="t">Self-attention × 2 blocks</div><div class="d">full K×K attention — 4,096 pairs at K=64 vs. ~1.76M at C=1,326 — the exact routing ISAB had to approximate with inducing points is affordable here directly</div></div>
    <div class="down">↓</div>
    <div class="box"><div class="t">Per-bucket head</div><div class="d">one EV scalar per bucket per player out — 2×K = 128 numbers, not 2×C = 2,652</div></div>
    <div class="down">↓</div>
    <div class="box dashed"><div class="t">in C++, not the network</div><div class="d">expand each bucket's EV to every combo inside it (constant within the bucket) × that combo's exact matchup × pot → final per-combo CFV</div></div>
  </div>
</div>

Laid end to end, these trace a real speed/accuracy frontier:

<div class="we-figbox">
  <svg viewBox="0 0 700 320" role="img" aria-label="Scatter chart plotting forward-pass microseconds per sample against exploitability relative to the theoretical floor, for the flat MLP, Perceiver, Set Transformer, and K-token architectures. Up and to the left is better.">
    <line x1="54" y1="22" x2="54" y2="274" stroke="#d4d4d4" stroke-width="1" />
    <line x1="54" y1="274" x2="616" y2="274" stroke="#d4d4d4" stroke-width="1" />
    <g stroke="#f0f0f0" stroke-width="1">
      <line x1="54" y1="22" x2="616" y2="22" />
      <line x1="54" y1="96.1" x2="616" y2="96.1" />
      <line x1="54" y1="170.2" x2="616" y2="170.2" />
      <line x1="54" y1="244.4" x2="616" y2="244.4" />
    </g>
    <g fill="#a3a3a3" font-size="10" text-anchor="end">
      <text x="44" y="25">1.0×</text>
      <text x="44" y="99.1">1.5×</text>
      <text x="44" y="173.2">2.0×</text>
      <text x="44" y="247.4">2.5×</text>
    </g>
    <g fill="#a3a3a3" font-size="10" text-anchor="middle">
      <text x="129.1" y="290">1</text>
      <text x="221.9" y="290">5</text>
      <text x="291.5" y="290">10</text>
      <text x="389.9" y="290">20</text>
      <text x="465.3" y="290">30</text>
      <text x="585" y="290">50</text>
    </g>
    <text x="54" y="312" fill="#a3a3a3" font-size="10.5">forward pass, µs/sample →</text>
    <text x="54" y="14" fill="#a3a3a3" font-size="10.5">↑ closer to the exact CFR floor (better)</text>
    <g text-anchor="middle">
      <circle cx="160.2" cy="177.7" r="6" fill="#3b82f6" />
      <text x="160.2" y="163.7" fill="#525252" font-size="11" font-weight="500">Flat MLP</text>
      <text x="160.2" y="199.7" fill="#a3a3a3" font-size="9.5">~0.8–2.5 µs/sample · 1.5–2.6× floor</text>
      <circle cx="238" cy="44.2" r="6" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 2" />
      <text x="238" y="30.2" fill="#525252" font-size="11" font-weight="500">K-token (deployed)</text>
      <text x="238" y="66.2" fill="#a3a3a3" font-size="9.5">K=64 tokens · matched accuracy</text>
      <circle cx="398.2" cy="51.7" r="6" fill="#3b82f6" />
      <text x="398.2" y="37.7" fill="#525252" font-size="11" font-weight="500">LatentEQ-Perceiver</text>
      <text x="398.2" y="73.7" fill="#a3a3a3" font-size="9.5">21 µs/sample · 1.20× floor</text>
      <circle cx="579.7" cy="41.3" r="6" fill="#3b82f6" />
      <text x="579.7" y="27.3" fill="#525252" font-size="11" font-weight="500">ISAB Set Transformer</text>
      <text x="579.7" y="63.3" fill="#a3a3a3" font-size="9.5">49 µs/sample · 1.06–1.13× floor</text>
    </g>
  </svg>
  <div class="we-note">K-token's position is qualitative — matched accuracy on the reduced-deck gate and a deck-independent token count — rather than a re-benchmarked µs figure for the exact shipped checkpoint.</div>
</div>

One free, always-take lever underneath all of this: exporting weights at half precision (fp16)
instead of fp32 — no accuracy cost, worth **1.1–1.4×** forward speed on every architecture tried.

<div class="we-callout loss" markdown="1">
<div class="we-callout-title">THE METHODOLOGICAL TRAP THAT RECURRED ALL PROJECT</div>

Validation error **repeatedly ranked changes backwards** relative to what actually mattered.
Equity inputs made CFV error *worse* while cutting exploitability 24%; the best-ever validation
fit posted the worst exploitability of its cohort. Every decision above was gated on **measured
solve quality** — the tail of exploitability across many boards — never on training-label fit.
</div>

## How the training data works

The honest answer isn't "solve a million random poker hands." Boards are drawn uniformly at
random — no texture is over-represented. Ranges are not: they come from a deliberate mixture
built to resemble what a real CFR trunk actually queries, escalating in realism across four
layers:

<div class="we-figbox">
  <div class="we-ladder">
    <div class="rung"><span class="t">Dirichlet(α) random</span><span class="d">flat i.i.d. weights over the board's valid combos — the naive baseline</span><span class="g">~30% of the mix, as a tail</span></div>
    <span class="arr">→</span>
    <div class="rung"><span class="t">R(S,p) structured</span><span class="d">DeepStack-style recursive split by hand strength — polarized, capped ranges a real strategy could actually produce</span><span class="g">~70% of the mix</span></div>
    <span class="arr">→</span>
    <div class="rung"><span class="t">Trunk emulator</span><span class="d">a parametric model fit to real trunk-visited PBS statistics — on-distribution-like, without solving a trunk</span><span class="g">bootstraps up-street data</span></div>
    <span class="arr">→</span>
    <div class="rung"><span class="t">Real trunk dump</span><span class="d">DUMP_RANGES records exact PBSs a real trunk visits mid-solve; those get re-labeled, not a synthetic stand-in</span><span class="g">the proven lever — 72k of 397k</span></div>
  </div>
  <div class="we-note">cheaper, less on-distribution ← → more expensive, closer to what the trunk actually queries</div>
</div>

The production default is 70% **R(S,p)** — a DeepStack-style recursive split by hand strength
that produces polarized, capped ranges a real strategy would show — plus 30% Dirichlet noise for
tail coverage, not the flat, every-hand-equally-likely ranges a naive sampler gives. Pot and
stack depth exclude degenerate near-zero/near-all-in extremes, and a recent turn-net retrain
added a dedicated low-SPR slice because real flop action rarely stacks it all in.

Two further layers push past synthetic sampling: a **trunk emulator** (a parametric model fit to
real trunk-visited range statistics) approximates on-distribution data without solving a trunk,
and the real thing — a hook that records the exact PBSs an actual CFR trunk visits mid-solve and
re-labels *those* — is the best-proven lever in the project: **−43%** versus a same-volume random
control at a fifth of the data, and on the full deck, **−7% / −14% / −22%** top-5 excess
exploitability in-distribution / on fresh boards / on a never-touched holdout. The deployed river
network mixes 325k structured-random samples with 72k of this real, mined data.

This works with far less data than DeepStack (~10M samples) or ReBeL (unbounded self-play) for
three compounding reasons: weight-sharing across all 1,326 combos turns 400k samples into roughly
a billion effective labels for a ~150k-parameter model; equity-vs-range and the EV target remove
most of the learning problem up front; and because training data comes from the trunk's own query
distribution, evaluation and training match almost exactly.

<div class="we-callout" markdown="1">
<div class="we-callout-title">THE HONEST CAVEAT</div>

That last advantage is rung-specific. It erodes once a turn network has to train on solves that
call a river network for its own leaf values (bootstrapped, noisier labels return), and once the
product surface widens from "whatever this project's own trunk visits" to any spot a user enters.
</div>

## The multi-street puzzle

Depth-limited CFR-D has a known hazard: plugging one fixed value function into a subgame root and
treating it as terminal, with no re-solving gadget, is textbook **unsafe**. Measuring it
directly — a perfect, non-learned evaluator standing in below the cut — found the split:
decomposing the tree itself accounted for about **98%** of the excess exploitability, and
turn-network quality — the thing most of the earlier effort had gone into — only about **2%**.

That pointed toward a theoretical fix — a re-solving gadget or multi-valued states. But a more
careful measurement (after catching a harness bug that had briefly hidden a real result) found
something simpler: cutting the depth limit **one street later** — letting the trunk actually play
out the turn betting round instead of handing off at the turn card — took the flop policy's
exploitability from **~15.6×** the exact floor to **~0.7×**, a **95.5% reduction**, with no
architecture change at all.

<div class="we-callout win" markdown="1">
<div class="we-callout-title">A DEPTH-LIMITED SOLVE IS NEAR-OPTIMAL AT ITS OWN ROOT STREET, AND BAD AT THE STREET RIGHT ABOVE THE LIMIT</div>

What looked like it might need a fundamentally harder fix turned out to be about *where the cut
sits*, not *what stands in for the tree below it*. (Going one street deeper still runs out of
memory at the full deck — an engineering problem, still being worked, not a scientific one.)
</div>

## Making it fast enough to be a web app

None of the accuracy work matters if a solve takes twenty minutes. A full flop-root solve at the
standard 52-card deck went from **~1,413 seconds** to **~54 seconds** through a sequence of
targeted, measured fixes:

<div class="we-figbox">
  <div class="we-bars">
    <div class="row">
      <div class="lbl"><span>Early production baseline</span><b>1413s</b></div>
      <div class="track"><div class="fill" style="width:100%"></div></div>
      <div class="sub">the starting point</div>
    </div>
    <div class="row">
      <div class="lbl"><span>Board-card cross-attention; equity input dropped on 4-card roots</span><b>145.6s</b></div>
      <div class="track"><div class="fill" style="width:10.3%"></div></div>
      <div class="sub">9.7× faster</div>
    </div>
    <div class="row">
      <div class="lbl"><span>Batched exact all-in pricing replaces a bucketed approximation</span><b>82.2s</b></div>
      <div class="track"><div class="fill" style="width:5.82%"></div></div>
      <div class="sub">1.77× more</div>
    </div>
    <div class="row">
      <div class="lbl"><span>Same-day follow-on tuning</span><b>53.8s</b></div>
      <div class="track"><div class="fill" style="width:3.81%"></div></div>
      <div class="sub">26× the starting point</div>
    </div>
  </div>
  <div class="we-note">One standard_52 flop-root solve, 375 fixed iterations, same production defaults throughout — measured sequentially in one session (2026-08-10).</div>
</div>

The two biggest single wins: giving each hand's token direct attention over the board cards let
the network drop a separate, expensive equity calculation on turn-rooted subgames (~217s → well
under a second); and re-deriving how all-in showdowns were priced — batching every all-in leaf
sharing a board into one matrix multiply instead of streaming a value matrix tens of thousands of
times — cut that traffic **over 100×** and came out *faster*, not slower, while also fixing a
real bug along the way. On the engine side, a portable PyTorch (ATen) rewrite closed to within
~10% of a hand-written CUDA kernel's speed and became the default, since it runs on any GPU or
CPU PyTorch supports rather than locking to NVIDIA hardware; later profiling found still more —
parallelizing an already-independent per-board lookup table bought a further **2×**.

## Where things stand

Today, both the turn and river value networks share the K-token architecture, the default engine
is the portable ATen path, and the trunk solver early-stops on convergence instead of always
running a fixed iteration budget. On top of the base solve, the app supports warm-starting,
locking a decision and re-solving around it, and applying opponent profiles — each verified
against the reference engine before shipping.

<figure>
  <img src="{{ '/assets/poker_engine/combos.png' | relative_url }}" alt="The combos detail panel showing individual Q9o combinations with their blocker cards, action-mix bars, and backdoor-draw hand classification.">
  <figcaption>One layer deeper: every combo in a hand class, its exact blockers, and its own action mix — the per-combo detail the strategy grid above is built from.</figcaption>
</figure>

What's still open: there's no formal exploitability gate at the full 52-card deck yet (the
reference measurement runs out of memory at that size), so full-deck validation rests on held-out
comparisons rather than one clean end-to-end number; extending the depth-limited solve past the
flop is gated on the same constraint; and connected, high-card-heavy ("broadway") boards remain
the hardest residual across every architecture tried.

The thread running through all of it: measure before optimizing, distrust averages when a tail
statistic is what matters, and don't be afraid to reverse a conclusion when a better-controlled
experiment contradicts it — several of the results above *are* reversals of earlier ones.

## References

The papers and reference implementations behind the choices above.

<div class="we-refs" markdown="0">
  <div>
    <h4>Papers</h4>
    <ul>
      <li><a href="https://arxiv.org/abs/1303.4441" target="_blank" rel="noopener noreferrer">Solving Imperfect Information Games Using Decomposition (CFR-D)</a><span class="m">Burch, Johanson, Bowling — AAAI 2014</span><span class="m">the core algorithm this whole solver implements</span></li>
      <li><a href="https://arxiv.org/abs/1701.01724" target="_blank" rel="noopener noreferrer">DeepStack: Expert-Level AI in No-Limit Poker</a><span class="m">Moravčík et al. — 2017</span><span class="m">the direct ancestor of the trunk + learned-value-network approach</span></li>
      <li><a href="https://arxiv.org/abs/2007.13544" target="_blank" rel="noopener noreferrer">Combining Deep Reinforcement Learning and Search (ReBeL)</a><span class="m">Brown, Bakhtin, Lerer, Gong — 2020</span><span class="m">the self-play / continual-training pattern behind the ring-buffer trainer</span></li>
      <li><a href="https://ojs.aaai.org/index.php/AAAI/article/view/25661" target="_blank" rel="noopener noreferrer">Don't Predict Counterfactual Values, Predict Expected Values Instead</a><span class="m">Wolosiuk, Świechowski, Mańdziuk — AAAI 2023</span><span class="m">the argument for the EV-not-CFV training target</span></li>
      <li><a href="https://arxiv.org/abs/1810.00825" target="_blank" rel="noopener noreferrer">Set Transformer</a><span class="m">Lee et al. — ICML 2019</span><span class="m">inducing-point attention — the ISAB architecture</span></li>
      <li><a href="https://arxiv.org/abs/2107.14795" target="_blank" rel="noopener noreferrer">Perceiver IO</a><span class="m">Jaegle et al. — 2021</span><span class="m">the latent-bottleneck architecture behind LatentEQ-Perceiver</span></li>
      <li><a href="https://arxiv.org/abs/1809.04040" target="_blank" rel="noopener noreferrer">Solving Imperfect-Information Games via Discounted Regret Minimization (DCFR)</a><span class="m">Brown, Sandholm — AAAI 2019</span><span class="m">the regret-discounting scheme the trunk's CFR loop runs</span></li>
      <li><a href="https://arxiv.org/abs/1705.02955" target="_blank" rel="noopener noreferrer">Safe and Nested Subgame Solving for Imperfect-Information Games</a><span class="m">Brown, Sandholm — NeurIPS 2017</span><span class="m">the re-solving-gadget literature weighed in the multi-street investigation</span></li>
      <li><a href="https://arxiv.org/abs/1811.00164" target="_blank" rel="noopener noreferrer">Deep Counterfactual Regret Minimization</a><span class="m">Brown, Lerer, Gross, Sandholm — ICML 2019</span><span class="m">the rank/suit/card embedding style used in the ISAB and K-token tokenizers</span></li>
    </ul>
  </div>
  <div>
    <h4>Code Referenced</h4>
    <ul>
      <li><a href="https://github.com/b-inary/wasm-postflop" target="_blank" rel="noopener noreferrer">wasm-postflop</a><span class="m">informed the web app's navigation model — free within-street browsing, a real re-solve only on a new street</span></li>
      <li><a href="https://github.com/b-inary/postflop-solver" target="_blank" rel="noopener noreferrer">postflop-solver</a><span class="m">the Rust CFR engine wasm-postflop wraps; kept alongside it as the underlying solver reference</span></li>
      <li><a href="https://github.com/exinori/DCFR-SOLVER" target="_blank" rel="noopener noreferrer">DCFR-SOLVER</a><span class="m">consulted for CFR speed techniques — chance-node isomorphism, frozen-root tricks — during solve-time profiling</span></li>
    </ul>
  </div>
</div>

</div>
