import json
import traceback
from pathlib import Path
from aqt import mw, gui_hooks
from aqt.qt import (
    QDialog,
    QVBoxLayout,
    QLabel,
    QHBoxLayout,
    QSlider,
    Qt,
    QDialogButtonBox,
    QComboBox,
    QCheckBox,
    QScrollArea,
    QWidget,
)
import aqt

from . import kanji_trainer

ADDON_PATH = Path(__file__).parent
mw.addonManager.setWebExports(__name__, r"(web/.*|kanji-trainer-visualizer\.iife\.js)")

def on_mount_web_content(web_content, context):
    if not isinstance(context, (aqt.reviewer.Reviewer, aqt.previewer.Previewer)):
        return

    addon_name = ADDON_PATH.name
    painter_url = f"/_addons/{addon_name}/web/painter.js"
    js_url = f"/_addons/{addon_name}/web/trainer.js"
    visualizer_url = f"/_addons/{addon_name}/kanji-trainer-visualizer.iife.js"
    web_content.js.append(painter_url)
    web_content.js.append(visualizer_url)
    web_content.js.append(js_url)
    config = mw.addonManager.getConfig(__name__)
    web_content.head += f"<script>var KANJI_VALIDATOR_ADDON_NAME = '{addon_name}'; var KANJI_VALIDATOR_CONFIG = {json.dumps(config)};</script>"

class SettingsDialog(QDialog):
    def __init__(self, mw):
        super().__init__(mw)
        self.mw = mw
        self.setWindowTitle("Kanji Validator Settings")
        self.setup_ui()

    def setup_ui(self):
        main_layout = QVBoxLayout()
        self.config = self.mw.addonManager.getConfig(__name__)

        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setMinimumHeight(400)
        scroll_area.setMinimumWidth(450)

        scroll_content = QWidget()
        layout = QVBoxLayout(scroll_content)

        self.sliders = {}
        controls = [
            ("dtw_threshold", "Stroke direction (DTW)"),
            ("rms_threshold", "Stroke shape (RMS)"),
            ("position_threshold", "Stroke position"),
            ("angle_threshold", "Relative angles between strokes"),
        ]

        for key, label_text in controls:
            label = QLabel(label_text)
            layout.addWidget(label)
            
            h_layout = QHBoxLayout()
            slider = QSlider(Qt.Orientation.Horizontal)
            slider.setMinimum(0)
            slider.setMaximum(100)
            val = int(self.config.get(key, 0.25) * 100)
            slider.setValue(val)
            
            val_label = QLabel(f"{val / 100:.2f}")
            slider.valueChanged.connect(
                lambda v, label_ref=val_label: label_ref.setText(f"{v / 100:.2f}")
            )
            
            h_layout.addWidget(slider)
            h_layout.addWidget(val_label)
            layout.addLayout(h_layout)
            self.sliders[key] = slider

        layout.addSpacing(10)
        layout.addWidget(QLabel("Answer buttons type:"))
        self.answer_type_combo = QComboBox()
        self.answer_type_combo.addItem("4 options (Again, Hard, Good, Easy)", "4_options")
        self.answer_type_combo.addItem("2 options (Again, Good)", "again_good")
        self.answer_type_combo.addItem("None", "none")
        
        current_type = self.config.get("answer_type", "4_options")
        index = self.answer_type_combo.findData(current_type)
        if index != -1:
            self.answer_type_combo.setCurrentIndex(index)
        layout.addWidget(self.answer_type_combo)

        layout.addSpacing(10)
        layout.addWidget(QLabel("Guide lines:"))
        self.guide_lines_combo = QComboBox()
        self.guide_lines_combo.addItem("None", "none")
        self.guide_lines_combo.addItem("Horizontal and vertical", "cross")
        self.guide_lines_combo.addItem("Diagonal", "diagonal")
        self.guide_lines_combo.addItem("Both", "both")

        current_guide = self.config.get("guide_lines", "cross")
        index = self.guide_lines_combo.findData(current_guide)
        if index != -1:
            self.guide_lines_combo.setCurrentIndex(index)
        layout.addWidget(self.guide_lines_combo)

        layout.addSpacing(10)
        self.pressure_checkbox = QCheckBox("Enable pressure sensitivity")
        self.pressure_checkbox.setChecked(self.config.get("pressure_sensitivity", True))
        layout.addWidget(self.pressure_checkbox)

        self.hint_button_checkbox = QCheckBox("Show Hint button")
        self.hint_button_checkbox.setChecked(self.config.get("show_hint_button", True))
        layout.addWidget(self.hint_button_checkbox)

        layout.addSpacing(5)
        layout.addWidget(QLabel("Line thickness:"))
        thickness_layout = QHBoxLayout()
        self.thickness_slider = QSlider(Qt.Orientation.Horizontal)
        self.thickness_slider.setMinimum(1)
        self.thickness_slider.setMaximum(20)
        thickness_val = int(self.config.get("line_thickness", 7))
        self.thickness_slider.setValue(thickness_val)
        thickness_label = QLabel(f"{thickness_val}")
        self.thickness_slider.valueChanged.connect(
            lambda v, label_ref=thickness_label: label_ref.setText(f"{v}")
        )
        thickness_layout.addWidget(self.thickness_slider)
        thickness_layout.addWidget(thickness_label)
        layout.addLayout(thickness_layout)

        layout.addSpacing(5)
        layout.addWidget(QLabel("Panel scale:"))
        scale_layout = QHBoxLayout()
        self.scale_slider = QSlider(Qt.Orientation.Horizontal)
        self.scale_slider.setMinimum(50)
        self.scale_slider.setMaximum(150)
        scale_val = int(self.config.get("panel_scale", 1.0) * 100)
        self.scale_slider.setValue(scale_val)
        scale_label = QLabel(f"{scale_val}%")
        self.scale_slider.valueChanged.connect(
            lambda v, label_ref=scale_label: label_ref.setText(f"{v}%")
        )
        scale_layout.addWidget(self.scale_slider)
        scale_layout.addWidget(scale_label)
        layout.addLayout(scale_layout)

        layout.addSpacing(10)
        layout.addWidget(QLabel("Default result visualization mode:"))
        self.initial_mode_combo = QComboBox()
        self.initial_mode_combo.addItem("Draw", "draw")
        self.initial_mode_combo.addItem("Draw (loop)", "draw_loop")
        self.initial_mode_combo.addItem("Morph", "morph")
        self.initial_mode_combo.addItem("Morph (loop)", "morph_loop")
        self.initial_mode_combo.addItem("Overall", "overall")

        current_mode = self.config.get("initial_mode", "morph_loop")
        index = self.initial_mode_combo.findData(current_mode)
        if index != -1:
            self.initial_mode_combo.setCurrentIndex(index)
        layout.addWidget(self.initial_mode_combo)

        layout.addStretch()

        scroll_area.setWidget(scroll_content)
        main_layout.addWidget(scroll_area)

        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        main_layout.addWidget(buttons)
        
        self.setLayout(main_layout)

    def accept(self):
        for key, slider in self.sliders.items():
            self.config[key] = slider.value() / 100
        self.config["answer_type"] = self.answer_type_combo.currentData()
        self.config["guide_lines"] = self.guide_lines_combo.currentData()
        self.config["pressure_sensitivity"] = self.pressure_checkbox.isChecked()
        self.config["show_hint_button"] = self.hint_button_checkbox.isChecked()
        self.config["line_thickness"] = self.thickness_slider.value()
        self.config["panel_scale"] = self.scale_slider.value() / 100
        self.config["initial_mode"] = self.initial_mode_combo.currentData()
        self.mw.addonManager.writeConfig(__name__, self.config)
        super().accept()

def show_settings():
    dialog = SettingsDialog(mw)
    dialog.exec()

mw.addonManager.setConfigAction(__name__, show_settings)

validator = kanji_trainer.KanjiValidator(str(ADDON_PATH / "kanji_vg"))

def on_js_message(handled, message, context):
    if message.startswith("answer_kanji:"):
        try:
            ease = int(message.removeprefix("answer_kanji:"))
            
            def handle_answer():
                if mw.reviewer.state == "question":
                    mw.reviewer._showAnswer()
                mw.reviewer._answerCard(ease)

            mw.taskman.run_on_main(handle_answer)
        except Exception as e:
            print(f"Error answering card: {e}")
        return (True, None)

    if message.startswith("get_hint_kanji:"):
        try:
            char = message.removeprefix("get_hint_kanji:")
            if validator.has_kanji(char):
                raw_strokes = validator.get_kanji(char)
                strokes = []
                for stroke in raw_strokes:
                    points = []
                    for p in stroke.points:
                        if len(p) >= 2:
                            points.append([float(p[0]), float(p[1])])
                    if points:
                        strokes.append(points)
                payload = {
                    'kanji': char,
                    'strokes': strokes
                }
                context.web.eval(f"displayHintResult({json.dumps(payload)})")
            else:
                context.web.eval(f"displayHintResult({json.dumps({'error': 'Not found'})})")
        except Exception as e:
            print(f"Error getting hint kanji: {e}")
        return (True, None)

    if not message.startswith("validate_kanji:"):
        return handled

    try:
        payload = json.loads(message.removeprefix("validate_kanji:"))
        char = payload['kanji']
        user_strokes = []
        for stroke in payload.get('strokes', []):
            clamped_stroke = []
            for p in stroke:
                if len(p) >= 2:
                    x = max(0.0, min(1.0, float(p[0])))
                    y = max(0.0, min(1.0, float(p[1])))
                    clamped_stroke.append((x, y))
            if clamped_stroke:
                user_strokes.append(clamped_stroke)

        config = mw.addonManager.getConfig(__name__)
        dtw = config.get("dtw_threshold", 0.25)
        rms = config.get("rms_threshold", 0.25)
        pos = config.get("position_threshold", 0.25)
        angle = config.get("angle_threshold", 0.5)

        thresholds = kanji_trainer.PyValidationThresholds(dtw, rms, pos, angle)
        
        if not validator.has_kanji(char):
            context.web.eval("displayValidationResult({'error': 'Not found'})")
            return (True, None)

        result = validator.validate_kanji(char, user_strokes, thresholds, 20)
        
        validation_json = result.to_json(False)
        answer_type_json = json.dumps(config.get("answer_type", "4_options"))
        context.web.eval(
            f"displayValidationResult({{validation: {validation_json}, answer_type: {answer_type_json}}})"
        )
    except Exception as e:
        print(f"Error in Kanji Trainer: {e}")
        print(traceback.format_exc())
        safe_error = json.dumps({'error': f'Validation failed: {str(e)}'})
        context.web.eval(f"displayValidationResult({safe_error})")

    return (True, None)

gui_hooks.webview_will_set_content.append(on_mount_web_content)
gui_hooks.webview_did_receive_js_message.append(on_js_message)
