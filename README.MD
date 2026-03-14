# Kanji Trainer

An Anki addon for practicing kanji handwriting. Displays a drawing canvas on the card, validates the user's strokes against reference data from KanjiVG, and shows a per-stroke breakdown of the result.

The addon is designed to accommodate different approaches to kanji study. Some users only need a rough match to feel confident about a character; others want strict validation where even small deviations matter. The thresholds are fully configurable to match either approach. The validation metrics are provided for reference - you are not required to follow them. In practice, the most convenient way to judge correctness is to watch the morph animation, which shows how your drawing transitions into the reference character.

The addon can also be useful for people who do not intend to practice writing at all. Reproducing a kanji from memory forces you to recall its full structure rather than just a vague overall image. This kind of recall can help reduce confusion between visually similar characters when reading.

## Features

- Drawing canvas embedded directly in the Anki reviewer
- Stroke validation against KanjiVG reference data with four independent metrics
- Animated result visualization (morph, draw, loop modes)
- Configurable validation thresholds per metric
- Configurable answer buttons: 4-option, 2-option, or none
- Optional guide lines on the canvas
- Pressure sensitivity support for stylus input
- Light and dark theme support

## Card Template Setup

Add the following element to **both the front and back** of your card template:

```html
<div id="kanji-trainer" data-kanji="{{YourKanjiField}}"></div>
```

Replace `{{YourKanjiField}}` with the name of the field that contains the kanji. Only the first character of the field value is used.

Both sides are required: the front hosts the drawing canvas, and the back runs the validation after the card flips. The `data-kanji` attribute must match on both sides.

## Usage

Draw the kanji on the canvas. Use **Undo** to remove the last stroke, **Clear** to reset, and **Hint** to overlay reference stroke paths. Press **Check** to submit - the card flips and validation runs automatically. After validation, rate the card with the answer buttons. Press **Clear** again to redraw.

## Validation Metrics

Each stroke is evaluated on four criteria:

| Metric | Description |
|---|---|
| Stroke direction (DTW) | Path shape compared via dynamic time warping |
| Stroke shape (RMS) | Root mean square deviation of the normalized stroke path |
| Stroke position | Where the stroke is placed within the character bounding box |
| Relative angles | Angles between consecutive strokes |

Each metric has a configurable threshold. Higher values mean more lenient validation.

## Settings

Open via **Tools > Add-ons > Kanji Trainer > Config**.

| Setting | Values | Default | Description |
|---|---|---|---|
| Stroke direction (DTW) threshold | 0.00 – 1.00 | 0.20 | Tolerance for stroke path direction |
| Stroke shape (RMS) threshold | 0.00 – 1.00 | 0.25 | Tolerance for stroke shape deviation |
| Stroke position threshold | 0.00 – 1.00 | 0.25 | Tolerance for stroke placement |
| Relative angles threshold | 0.00 – 1.00 | 0.50 | Tolerance for inter-stroke angle |
| Answer buttons type | `4_options` / `again_good` / `none` | `again_good` | Which rating buttons are shown after validation |
| Guide lines | `none` / `cross` / `diagonal` / `both` | `cross` | Reference lines drawn on the canvas |
| Pressure sensitivity | on / off | off | Whether stylus pressure affects stroke width |
| Show Hint button | on / off | on | Whether the Hint button is visible |
| Line thickness | 1 – 20 | 7 | Drawn stroke width in pixels |
| Panel scale | 50% – 150% | 100% | Scale factor for the entire trainer panel |
| Default result visualization mode | `draw` / `draw_loop` / `morph` / `morph_loop` / `overall` | `morph_loop` | Initial display mode of the result panel |

## Result Visualization Modes

| Mode | Description |
|---|---|
| Draw | Animates your strokes once |
| Draw (loop) | Animates your strokes in a loop |
| Morph | Animates the transition from your strokes to the reference once |
| Morph (loop) | Animates the transition in a loop |
| Overall | Static overlay view |
