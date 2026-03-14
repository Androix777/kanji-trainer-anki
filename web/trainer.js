(function() {
    let painter = null;
    let validationPanel = null;
    let cachedHtml = null;
    let cachedCss = null;
    let hostContainer = null;
    let root = null;

    function byId(id) {
        return root ? root.getElementById(id) : null;
    }

    function query(selector) {
        return root ? root.querySelector(selector) : null;
    }

    function detectThemeMode() {
        if (
            document.documentElement.classList.contains('nightMode') ||
            document.body.classList.contains('nightMode')
        ) {
            return 'dark';
        }
        return 'light';
    }

    function withThemeColors(config, themeMode) {
        const nextConfig = Object.assign({}, config || {});
        const defaults = themeMode === 'dark'
            ? {
                stroke_color: '#edf2fb',
                guide_color: 'rgba(166, 178, 198, 0.56)',
                hint_color: 'rgba(166, 178, 198, 0.28)',
            }
            : {
                stroke_color: '#2a3342',
                guide_color: 'rgba(102, 117, 139, 0.52)',
                hint_color: 'rgba(102, 117, 139, 0.24)',
            };

        if (nextConfig.stroke_color == null) nextConfig.stroke_color = defaults.stroke_color;
        if (nextConfig.guide_color == null) nextConfig.guide_color = defaults.guide_color;
        if (nextConfig.hint_color == null) nextConfig.hint_color = defaults.hint_color;
        return nextConfig;
    }

    function bindControls() {
        const btnUndo = byId('btn-undo');
        const btnClear = byId('btn-clear');
        const btnHint = byId('btn-hint');
        const btnCheck = byId('btn-check');
        const btnRateClear = byId('btn-rate-clear');
        const btnAgain = byId('btn-rate-again');
        const btnHard = byId('btn-rate-hard');
        const btnGood = byId('btn-rate-good');
        const btnEasy = byId('btn-rate-easy');

        if (btnUndo) btnUndo.addEventListener('click', () => window.undoStroke());
        if (btnClear) btnClear.addEventListener('click', () => window.clearCanvas());
        if (btnHint) btnHint.addEventListener('click', () => window.toggleHint());
        if (btnCheck) btnCheck.addEventListener('click', () => window.checkDrawing());
        if (btnRateClear) btnRateClear.addEventListener('click', () => window.clearCanvas());
        if (btnAgain) btnAgain.addEventListener('click', () => window.answerCard(1));
        if (btnHard) btnHard.addEventListener('click', () => window.answerCard(2));
        if (btnGood) btnGood.addEventListener('click', () => window.answerCard(3));
        if (btnEasy) btnEasy.addEventListener('click', () => window.answerCard(4));
    }

    async function loadTemplates(addonName) {
        if (cachedHtml && cachedCss) return;
        const [htmlResponse, cssResponse] = await Promise.all([
            fetch(`/_addons/${addonName}/web/trainer.html`),
            fetch(`/_addons/${addonName}/web/trainer.css`),
        ]);
        cachedHtml = await htmlResponse.text();
        cachedCss = await cssResponse.text();
    }

    function applyScale(config) {
        const scale = config.panel_scale || 1.0;
        if (scale === 1.0) return;
        const ktContainer = query('.kt-container');
        if (!ktContainer) return;
        ktContainer.style.transform = `scale(${scale})`;
        ktContainer.style.transformOrigin = 'top center';
        const applyMargin = () => {
            const extraSpace = ktContainer.offsetHeight * (scale - 1);
            hostContainer.style.marginBottom = `${extraSpace}px`;
        };
        applyMargin();
        requestAnimationFrame(applyMargin);
    }

    function calculateCanvasSize(canvasArea, drawStage) {
        if (!canvasArea) return 450;
        const marginStyle = drawStage
            ? getComputedStyle(drawStage).getPropertyValue('--kt-stage-margin')
            : '24px';
        const margin = parseInt(marginStyle) || 24;
        return Math.min(canvasArea.clientWidth, canvasArea.clientHeight, 600) - margin;
    }

    function setupPainter(canvasElement, config, themeMode) {
        const hintBtn = byId('btn-hint');
        if (hintBtn && config.show_hint_button === false) {
            hintBtn.style.display = 'none';
        }

        painter = new KanjiPainter(canvasElement, withThemeColors(config, themeMode));
        painter.setGuideLines(config.guide_lines || 'none');
        painter.onStrokeChange = function(count) {
            const counter = byId('stroke-counter');
            if (counter) counter.innerText = count;
            const checkBtn = byId('btn-check');
            if (checkBtn) checkBtn.disabled = count === 0;
        };
    }

    function restoreSession(container) {
        const kanjiAttr = container.getAttribute('data-kanji');
        const kanji = kanjiAttr ? kanjiAttr[0] : null;
        const savedKanji = sessionStorage.getItem('kt_saved_kanji');

        if (savedKanji !== kanji) {
            sessionStorage.removeItem('kt_saved_strokes');
            sessionStorage.removeItem('kt_validate_after_flip');
            sessionStorage.removeItem('kt_saved_kanji');
            return;
        }

        const savedStrokes = sessionStorage.getItem('kt_saved_strokes');
        if (savedStrokes) {
            try {
                const strokes = JSON.parse(savedStrokes);
                if (strokes && strokes.length > 0) {
                    painter.strokes = strokes;
                    painter.redraw();
                    painter.onStrokeChange(painter.strokes.length);
                }
            } catch (e) {
                console.error("Failed to restore strokes:", e);
            }
        }

        if (sessionStorage.getItem('kt_validate_after_flip') === 'true') {
            sessionStorage.removeItem('kt_validate_after_flip');
            window.checkDrawing(true);
        }

        sessionStorage.removeItem('kt_saved_strokes');
        sessionStorage.removeItem('kt_saved_kanji');
    }

    function init() {
        const container = document.getElementById('kanji-trainer');
        if (container && !container.classList.contains('initialized')) {
            renderTrainer(container);
        }
    }

    async function renderTrainer(container) {
        container.classList.add('initialized');
        hostContainer = container;
        const themeMode = detectThemeMode();
        container.setAttribute('data-theme', themeMode);

        try {
            const addonName = typeof KANJI_VALIDATOR_ADDON_NAME !== 'undefined'
                ? KANJI_VALIDATOR_ADDON_NAME
                : 'kanji_validator';
            await loadTemplates(addonName);

            if (!container.shadowRoot) container.attachShadow({ mode: 'open' });
            root = container.shadowRoot;
            root.innerHTML = `<style>${cachedCss}</style>${cachedHtml}`;
            bindControls();

            const config = typeof KANJI_VALIDATOR_CONFIG !== 'undefined' ? KANJI_VALIDATOR_CONFIG : {};
            applyScale(config);

            const canvasElement = byId('paintCanvas');
            const resultPanel = byId('resultPanel');
            const drawStage = query('.kt-draw-stage');
            const size = calculateCanvasSize(query('.kt-canvas-area'), drawStage);

            if (canvasElement) {
                canvasElement.width = size;
                canvasElement.height = size;
            }
            if (drawStage) drawStage.style.visibility = 'visible';
            if (resultPanel) {
                resultPanel.style.display = 'none';
                resultPanel.innerHTML = '';
            }
            if (validationPanel) {
                validationPanel.dispose();
                validationPanel = null;
            }

            if (canvasElement && typeof KanjiPainter !== 'undefined') {
                setupPainter(canvasElement, config, themeMode);
                restoreSession(container);
            }
        } catch (e) {
            console.error("Failed to initialize trainer:", e);
        }
    }

    window.undoStroke = function() {
        if (painter) {
            painter.undo();
        }
    };

    window.toggleHint = function() {
        if (!painter || !hostContainer) return;

        const kanjiAttr = hostContainer.getAttribute('data-kanji');
        if (!kanjiAttr) return;
        const kanji = kanjiAttr[0];

        if (!painter.hintStrokes && typeof pycmd !== 'undefined') {
            pycmd("get_hint_kanji:" + kanji);
        }

        const isShown = painter.toggleHint();
        const btn = byId('btn-hint');
        if (btn) btn.classList.toggle('active', isShown);
    };

    window.displayHintResult = function(res) {
        if (res.strokes && painter) {
            painter.setHintStrokes(res.strokes);
        } else if (res.error) {
            console.error("Hint error:", res.error);
        }
    };

    window.clearCanvas = function() {
        if (painter) {
            painter.clear();
            painter.canvasElement.style.visibility = 'visible';
        }
        sessionStorage.removeItem('kt_saved_strokes');
        sessionStorage.removeItem('kt_validate_after_flip');

        const resultPanel = byId('resultPanel');
        const drawStage = query('.kt-draw-stage');
        if (resultPanel) resultPanel.style.display = 'none';
        if (drawStage) drawStage.style.visibility = 'visible';
        if (validationPanel) {
            validationPanel.dispose();
            validationPanel = null;
        }

        const counter = byId('stroke-counter');
        if (counter) counter.style.display = 'block';

        const btn = byId('btn-check');
        const undoBtn = byId('btn-undo');
        if (btn) {
            btn.disabled = true;
            btn.style.display = 'block';
        }
        if (undoBtn) undoBtn.style.display = 'block';

        const drawingBar = byId('drawing-bar');
        const ratingBar = byId('rating-bar');
        if (drawingBar) drawingBar.style.display = 'flex';
        if (ratingBar) ratingBar.style.display = 'none';
    };

    window.checkDrawing = function(forceValidate) {
        const strokes = painter ? painter.getStrokes() : [];
        if (!hostContainer || strokes.length === 0) return;

        const kanjiAttr = hostContainer.getAttribute('data-kanji');
        if (!kanjiAttr) return;

        const kanji = kanjiAttr[0];

        if (typeof pycmd !== 'undefined') {
            const isFront = document.getElementById('answer') === null;

            if (isFront && !forceValidate) {
                sessionStorage.setItem('kt_saved_kanji', kanji);
                sessionStorage.setItem('kt_saved_strokes', JSON.stringify(strokes));
                sessionStorage.setItem('kt_validate_after_flip', 'true');
                pycmd("ans");
            } else {
                const btn = byId('btn-check');
                if (btn) btn.disabled = true;
                pycmd("validate_kanji:" + JSON.stringify({kanji, strokes}));
            }
        }
    };

    window.answerCard = function(ease) {
        sessionStorage.removeItem('kt_saved_strokes');
        sessionStorage.removeItem('kt_validate_after_flip');
        sessionStorage.removeItem('kt_saved_kanji');

        if (typeof pycmd !== 'undefined') {
            pycmd("answer_kanji:" + ease);
        }
    };

    window.displayValidationResult = function(res) {
        const canvas = byId('paintCanvas');
        const resultPanel = byId('resultPanel');
        const drawStage = query('.kt-draw-stage');
        const counter = byId('stroke-counter');
        const drawingBar = byId('drawing-bar');
        const ratingBar = byId('rating-bar');

        if (res.validation && canvas && resultPanel) {
            if (drawingBar) drawingBar.style.display = 'none';
            if (ratingBar) {
                const answerType = res.answer_type || '4_options';

                if (answerType === 'none') {
                    ratingBar.style.display = 'none';
                    if (drawingBar) {
                        drawingBar.style.display = 'flex';
                        const checkBtn = byId('btn-check');
                        const undoBtn = byId('btn-undo');
                        if (checkBtn) checkBtn.style.display = 'none';
                        if (undoBtn) undoBtn.style.display = 'none';
                    }
                } else {
                    ratingBar.style.display = 'flex';
                    const showAllButtons = answerType !== 'again_good';
                    const hardBtn = ratingBar.querySelector('.k-hard');
                    const easyBtn = ratingBar.querySelector('.k-easy');
                    if (hardBtn) hardBtn.style.display = showAllButtons ? 'block' : 'none';
                    if (easyBtn) easyBtn.style.display = showAllButtons ? 'block' : 'none';
                }
            }

            if (
                typeof KanjiTrainerVisualizer === 'undefined' ||
                typeof KanjiTrainerVisualizer.createValidationGuiPanel !== 'function'
            ) {
                alert("Validation visualizer is not available.");
                const btn = byId('btn-check');
                if (btn) btn.disabled = false;
                return;
            }

            if (validationPanel) {
                validationPanel.setData(res.validation);
            } else {
                const themeMode = detectThemeMode();
                const config = typeof KANJI_VALIDATOR_CONFIG !== 'undefined' ? KANJI_VALIDATOR_CONFIG : {};
                validationPanel = KanjiTrainerVisualizer.createValidationGuiPanel(res.validation, {
                    initialMode: config.initial_mode || 'morph_loop',
                    themeMode: themeMode,
                });
                resultPanel.innerHTML = '';
                resultPanel.appendChild(validationPanel.element);
            }

            resultPanel.style.display = 'block';
            if (drawStage) drawStage.style.visibility = 'hidden';
            canvas.style.visibility = 'hidden';
            if (counter) counter.style.display = 'none';
        } else if (res.error) {
            alert("Error: " + res.error);
            const btn = byId('btn-check');
            if (btn) btn.disabled = false;
        }
    };

    const observer = new MutationObserver(() => {
        if (!document.getElementById('kanji-trainer')) {
            painter = null;
            root = null;
            hostContainer = null;
            if (validationPanel) {
                validationPanel.dispose();
                validationPanel = null;
            }
        }
        init();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    init();
})();
