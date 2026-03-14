(function() {
    function KanjiPainter(canvasElement, config) {
        this.canvasElement = canvasElement;
        this.context = canvasElement.getContext('2d');
        this.strokes = [];
        this.currentStroke = [];
        this.isDrawing = false;
        this.activePointerId = null;
        this.size = canvasElement.width;
        this.onStrokeChange = null;
        this.guideLines = 'none';
        this.config = config || {};
        this.strokeColor = this.config.stroke_color || '#e9eefc';
        this.guideColor = this.config.guide_color || 'rgba(176, 189, 214, 0.62)';
        this.hintColor = this.config.hint_color || 'rgba(170, 182, 204, 0.24)';
        this.hintStrokes = null;
        this.showHint = false;

        this.init();
    }

    KanjiPainter.prototype.init = function() {
        this.context.lineWidth = this.config.line_thickness || 7;
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.strokeStyle = this.strokeColor;

        this.startDrawing = this.startDrawing.bind(this);
        this.continueDrawing = this.continueDrawing.bind(this);
        this.stopDrawing = this.stopDrawing.bind(this);
        this.cancelDrawing = this.cancelDrawing.bind(this);

        this.canvasElement.addEventListener('pointerdown', this.startDrawing, { passive: false });
        this.canvasElement.addEventListener('pointermove', this.continueDrawing, { passive: false });
        this.canvasElement.addEventListener('pointerup', this.stopDrawing, { passive: false });
        this.canvasElement.addEventListener('pointerleave', this.stopDrawing, { passive: false });
        this.canvasElement.addEventListener('pointercancel', this.cancelDrawing, { passive: false });

        this.canvasElement.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvasElement.addEventListener('dragstart', (e) => e.preventDefault());
    };

    KanjiPainter.prototype.getCoords = function(e, rect) {
        if (!rect) rect = this.canvasElement.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const pressure = e.pressure !== undefined ? e.pressure : 0.5;
        return [
            Math.max(0, Math.min(1, x)),
            Math.max(0, Math.min(1, y)),
            pressure,
        ];
    };

    KanjiPainter.prototype.startDrawing = function(e) {
        if (this.isDrawing) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        
        const coords = this.getCoords(e);
        this.isDrawing = true;
        this.activePointerId = e.pointerId;
        this.currentStroke = [coords];
        
        if (e.pointerId !== undefined && this.canvasElement.setPointerCapture) {
            try {
                this.canvasElement.setPointerCapture(e.pointerId);
            } catch (err) {}
        }
    };

    KanjiPainter.prototype.continueDrawing = function(e) {
        if (!this.isDrawing) return;
        
        if (e.pointerId !== undefined && e.pointerId !== this.activePointerId) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();

        const events = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
        const rect = this.canvasElement.getBoundingClientRect();
        
        let last = this.currentStroke[this.currentStroke.length - 1];

        for (let i = 0; i < events.length; i++) {
            const coords = this.getCoords(events[i], rect);
            if (last) {
                if (last[0] !== coords[0] || last[1] !== coords[1]) {
                    this.context.beginPath();
                    this.context.moveTo(last[0] * this.size, last[1] * this.size);
                    this.context.lineTo(coords[0] * this.size, coords[1] * this.size);
                    
                    this.context.lineWidth = this.lineWidth(coords[2]);
                    this.context.stroke();

                    this.currentStroke.push(coords);
                    last = coords;
                }
            } else {
                this.currentStroke.push(coords);
                last = coords;
            }
        }
    };

    KanjiPainter.prototype.stopDrawing = function(e) {
        if (!this.isDrawing) return;
        
        if (e && e.pointerId !== undefined && e.pointerId !== this.activePointerId) {
            return;
        }
        
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (this.currentStroke.length > 0) {
            this.strokes.push(this.currentStroke);
            if (this.onStrokeChange) this.onStrokeChange(this.strokes.length);
        }
        
        this.isDrawing = false;
        this.currentStroke = [];
        
        if (e && e.pointerId !== undefined && this.canvasElement.releasePointerCapture) {
            try {
                this.canvasElement.releasePointerCapture(e.pointerId);
            } catch (err) {}
        }
        
        this.activePointerId = null;
    };

    KanjiPainter.prototype.cancelDrawing = function(e) {
        if (!this.isDrawing) return;
        
        if (e && e.pointerId !== undefined && e.pointerId !== this.activePointerId) {
            return;
        }
        
        this.isDrawing = false;
        this.currentStroke = [];
        this.activePointerId = null;
    };

    KanjiPainter.prototype.clear = function() {
        this.strokes = [];
        this.currentStroke = [];
        this.isDrawing = false;
        this.activePointerId = null;
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.drawGuideLines();
        this.drawHint();
        if (this.onStrokeChange) this.onStrokeChange(0);
    };

    KanjiPainter.prototype.undo = function() {
        if (this.strokes.length === 0) return;
        
        this.strokes.pop();
        this.redraw();
        if (this.onStrokeChange) this.onStrokeChange(this.strokes.length);
    };

    KanjiPainter.prototype.redraw = function() {
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.drawGuideLines();
        this.drawHint();
        
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.strokeStyle = this.strokeColor;

        for (let i = 0; i < this.strokes.length; i++) {
            const stroke = this.strokes[i];
            if (stroke.length === 0) continue;
            
            let last = stroke[0];
            for (let j = 1; j < stroke.length; j++) {
                const coords = stroke[j];
                this.context.beginPath();
                this.context.moveTo(last[0] * this.size, last[1] * this.size);
                this.context.lineTo(coords[0] * this.size, coords[1] * this.size);
                
                this.context.lineWidth = this.lineWidth(coords[2]);
                this.context.stroke();
                
                last = coords;
            }
        }
    };

    KanjiPainter.prototype.drawGuideLines = function() {
        if (this.guideLines === 'none') return;

        this.context.save();
        this.context.setLineDash([5, 5]);
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.guideColor;

        if (this.guideLines === 'cross' || this.guideLines === 'both') {
            this.context.beginPath();
            this.context.moveTo(this.size / 2, 0);
            this.context.lineTo(this.size / 2, this.size);
            this.context.stroke();

            this.context.beginPath();
            this.context.moveTo(0, this.size / 2);
            this.context.lineTo(this.size, this.size / 2);
            this.context.stroke();
        }

        if (this.guideLines === 'diagonal' || this.guideLines === 'both') {
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.lineTo(this.size, this.size);
            this.context.stroke();

            this.context.beginPath();
            this.context.moveTo(this.size, 0);
            this.context.lineTo(0, this.size);
            this.context.stroke();
        }

        this.context.restore();
    };

    KanjiPainter.prototype.drawHint = function() {
        if (!this.showHint || !this.hintStrokes) return;

        this.context.save();
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.strokeStyle = this.hintColor;
        this.context.lineWidth = this.config.line_thickness || 7;

        for (let i = 0; i < this.hintStrokes.length; i++) {
            const stroke = this.hintStrokes[i];
            if (stroke.length === 0) continue;

            this.context.beginPath();
            this.context.moveTo(stroke[0][0] * this.size, stroke[0][1] * this.size);
            for (let j = 1; j < stroke.length; j++) {
                this.context.lineTo(stroke[j][0] * this.size, stroke[j][1] * this.size);
            }
            this.context.stroke();
        }
        this.context.restore();
    };

    KanjiPainter.prototype.setHintStrokes = function(strokes) {
        this.hintStrokes = strokes;
        if (this.showHint) {
            this.redraw();
        }
    };

    KanjiPainter.prototype.toggleHint = function() {
        this.showHint = !this.showHint;
        this.redraw();
        return this.showHint;
    };

    KanjiPainter.prototype.lineWidth = function(pressure) {
        const base = this.config.line_thickness || 7;
        if (this.config.pressure_sensitivity === false) return base;
        return base * (pressure * 1.5 + 0.25);
    };

    KanjiPainter.prototype.setGuideLines = function(type) {
        this.guideLines = type;
        this.redraw();
    };

    KanjiPainter.prototype.getStrokes = function() {
        return this.strokes;
    };

    window.KanjiPainter = KanjiPainter;
})();
