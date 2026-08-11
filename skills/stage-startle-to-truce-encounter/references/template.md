# Startle-to-Truce Encounter Template

## Mechanism

A calm subject and a technical observer begin at a readable distance; alternating viewpoints establish asymmetric knowledge, one bounded defensive overreaction increases tension, the observed subject closes the distance and becomes the active side of the encounter, and a shared-axis gaze plus one small conciliatory gesture converts danger into an awkward truce attempt.

## Invariants

### inv-01 — Calm baseline before intrusion

- **Rule:** Establish the subject's stable behavior and the observer's initial distance before the threat changes.
- **Why it matters:** The later startle reads as a contrast rather than generic action noise.
- **Ablation:** Without a calm baseline, the viewer cannot tell what changed or why the reaction matters.

### inv-02 — Two viewpoints carry different information

- **Rule:** Give the subject and observer distinct proof views, such as exterior subject framing and an enclosed observer POV.
- **Why it matters:** The viewer understands who noticed whom and which side lacks information.
- **Ablation:** Without the observer view, surprise becomes an unsupported facial reaction.

### inv-03 — One bounded overreaction

- **Rule:** Use one readable, non-lethal alarm, recoil, evasive move, defensive burst, shield, marker, or countermeasure.
- **Why it matters:** A single escalation gives the encounter stakes without consuming the whole runtime.
- **Ablation:** Without it, the close appearance has no tension; with several unrelated attacks, causality collapses.

### inv-04 — Spatial power reversal is physically proved

- **Rule:** The formerly distant subject must close the separation and share one axis, matched motion, or one frame with the observer across a clear boundary.
- **Why it matters:** Proximity changes the subject from an object of observation into an active participant.
- **Ablation:** A reaction close-up without proximity proof leaves the encounter geography ambiguous.

### inv-05 — Gesture de-escalation receives a hold

- **Rule:** End with sustained eye contact and one small conciliatory offer; hold the other subject's visible reaction long enough to show the offer was perceived.
- **Why it matters:** Performance, not exposition or injury, supplies the payoff.
- **Ablation:** Cutting immediately after the gesture makes it decorative and leaves the relationship unresolved.

## Variable slots

```text
Duration/aspect: [4–15 seconds] / [requested ratio]
Calm subject: [role + stable identity anchors + baseline action]
Observer: [role + enclosure or viewing device]
Initial separation: [distance and spatial axis]
Boundary: [canopy, viewport, glass wall, holographic shield, water surface]
Observer viewpoint: [cockpit POV, instrument insert, over-shoulder, reaction close-up]
Bounded escalation: [alarm, recoil, flare, marker, shield, evasive motion]
Distance-closing action: [glide, swim, climb, roll, materialize, match speed]
Startle performance: [grip, shoulder recoil, head turn, breath, gaze]
Truce offer: [open palm, lowered tool, light signal, nod, object placement]
Held response: [gaze, softened posture, minimal reciprocal gesture, continued parallel motion]
Camera proof: [exterior geography, observer POV, shared-axis two-shot]
Sound: [ambient system + escalation transient + restrained ending]
```

## Anti-copy boundary

Do not reproduce the demonstration's fantasy woman, specific hair ornaments, fruit, sword flight, military jet, pilot costume, floating mountains, vertical light column, flare composition, or exact canopy staging. Do not turn those nouns into placeholders. Change subject category, observer system, environment, boundary, movement physics, escalation device, palette, sound family, camera implementation, and ending behavior together.

## Transfer tests

### Transfer A — deep-reef inspection truce

An adult bioluminescent reef courier rests above a thermal garden while a research submersible watches from a distance. The operator releases three harmless locator pods when the courier suddenly matches the vessel's speed. The courier appears beside the spherical viewport; the operator recoils, then presses an open palm to the glass. The courier holds eye contact and answers with a small two-finger signal. Water drag, buoyancy, amber cabin light, cyan organisms, sonar ticks, and a lateral underwater tracking axis replace every aerial and military surface.

### Transfer B — greenhouse guardian at the glass

A night horticulturist inside a climate-control booth notices a large luminous pollen guardian moving between dark greenhouse aisles. The automatic fans flare defensively and scatter mist. The guardian rides the airflow to the booth window and stops inches from the glass. The horticulturist lowers a mist nozzle, turns off the alarm, and places one seed tray at the sill; the guardian remains still while its wing light softens. Locked interior geometry, macro wing motion, wet glass reflections, fan-driven mist, and one static final two-shot replace vehicle pursuit.

Both transfers preserve `inv-01` through `inv-05` while changing subject, setting, physics, observer, boundary, escalation, camera, palette, sound, and ending object.

## Quality repairs

- **Prompt promises more than the video can hold:** reduce to calm baseline, observer reveal, one escalation, proximity proof, and truce hold.
- **Threat identity is ambiguous:** describe visible launch geometry and light behavior; do not label it as a missile, weapon, or attack without proof.
- **Close appearance feels like teleportation:** add a short distance-closing trajectory or a motivated occlusion before the shared-axis shot.
- **Eyelines miss across glass:** fix screen side, eye height, reflection, and matched speed before adding facial detail.
- **Startle is cartoonish:** use grip tension, shoulder recoil, breath, head turn, and widened eyes instead of screaming or loss of control.
- **Gesture has no payoff:** hold the receiver's gaze or posture change; reciprocity is optional.
- **Identity drifts:** bind two or three stable anchors and remove redundant beauty adjectives.
- **Result copies the sample:** replace every named subject, prop, vehicle, landscape, threat device, camera path, and ending gesture before compiling.

## Recommended enhancer input

```text
15秒，16:9。[平静主体]被[技术观察者]发现；观察者因主体突然贴近[透明边界]而做一次非致命惊慌反应。用外部空间镜头、观察者视角和最终同轴双人镜头证明距离反转。结尾让观察者迟疑地发出求和手势，主体以可读停留或最小回应结束。身份、载具、边界、相对速度、光向与视线连续，不受伤，不堆叠武器，不加字幕Logo水印。
```

## Model routing

- Use [h3-template.md](./h3-template.md) for MiniMax H3 Base or Ref2VA.
- Use [seedance-template.md](./seedance-template.md) for Seedance 2.0 text/image generation or multimodal reference.
