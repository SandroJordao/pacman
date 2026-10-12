/**
 * JS Document.
 * Sons sintetizados com a Web Audio API (não precisa de arquivos de áudio).
 * @author Sandro Jordão.
**/

'use strict';

const Sound = (function ()
{
	let ctx = null;
	let master;
	let muted = loadMuted();
	let held = false;
	let chompUp = false;

	// Sirene contínua: oscilador com a frequência balançada por um LFO
	let siren = null;
	let sirenKey = '';

	const SIRENS = {
		normal:     { type: 'triangle', volume: 0.07, rate: 2.5, depth: 80 },
		frightened: { type: 'square',   volume: 0.04, rate: 7,   depth: 40,  base: 180 },
		eyes:       { type: 'square',   volume: 0.04, rate: 9,   depth: 300, base: 900 }
	};

	function loadMuted()
	{
		try {
			return localStorage.getItem('pacman.muted') == '1';
		} catch (e) {
			return false;
		}
	}

	/**
	 * O navegador só libera o áudio depois de um toque ou tecla do jogador
	**/
	function unlock()
	{
		if (!ctx) {
			const AudioContext = window.AudioContext || window.webkitAudioContext;

			if (!AudioContext) {
				return;
			}

			ctx = new AudioContext();
			master = ctx.createGain();
			master.gain.value = muted ? 0 : 0.25;
			master.connect(ctx.destination);

			if (held) {
				ctx.suspend();
			}
		}

		if (ctx.state == 'suspended' && !document.hidden && !held) {
			ctx.resume();
		}
	}

	/**
	 * Congela todo o áudio (pausa / tela inicial), inclusive sons já agendados
	**/
	function hold(on)
	{
		held = on;

		if (!ctx) {
			return;
		}

		if (held) {
			ctx.suspend();
		} else if (!document.hidden) {
			ctx.resume();
		}
	}

	/**
	 * Uma nota com deslize de frequência (from -> to)
	**/
	function tone(type, from, to, start, duration, volume)
	{
		const t = ctx.currentTime + start;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(from, t);
		osc.frequency.linearRampToValueAtTime(to, t + duration);

		gain.gain.setValueAtTime(volume, t);
		gain.gain.setValueAtTime(volume, t + duration * 0.8);
		gain.gain.linearRampToValueAtTime(0, t + duration);

		osc.connect(gain);
		gain.connect(master);
		osc.start(t);
		osc.stop(t + duration + 0.02);
	}

	const EFFECTS = {
		// Vinheta de início (melodia própria)
		start: function ()
		{
			const notes = [523, 659, 784, 1047, 784, 1047, 1319];

			notes.forEach(function (freq, i) {
				const last = i == notes.length - 1;
				tone('square', freq, freq, i * 0.16, last ? 0.4 : 0.14, 0.25);
				tone('triangle', freq / 2, freq / 2, i * 0.16, last ? 0.4 : 0.14, 0.3);
			});
		},

		// "Waka": alterna um deslize para baixo e outro para cima
		chomp: function ()
		{
			chompUp = !chompUp;
			tone('triangle', chompUp ? 260 : 520, chompUp ? 520 : 260, 0, 0.08, 0.5);
		},

		eatGhost: function ()
		{
			tone('square', 200, 1400, 0, 0.3, 0.25);
		},

		// Começa depois de 1s, junto com a animação do Pacman sumindo
		death: function ()
		{
			for (let i = 0; i < 8; i++) {
				tone('square', 900 - i * 90, 700 - i * 90, 1 + i * 0.1, 0.1, 0.2);
			}

			tone('triangle', 400, 80, 1.85, 0.1, 0.4);
			tone('triangle', 400, 80, 2.0, 0.1, 0.4);
		},

		extraLife: function ()
		{
			for (let i = 0; i < 4; i++) {
				tone('square', 1300, 1300, i * 0.12, 0.08, 0.2);
			}
		}
	};

	function play(name)
	{
		if (ctx) {
			EFFECTS[name]();
		}
	}

	/**
	 * Troca o modo da sirene: 'normal', 'frightened', 'eyes' ou 'off'.
	 * progress (0 a 1) deixa a sirene normal mais aguda conforme as pastilhas acabam.
	**/
	function setSiren(mode, progress)
	{
		if (!ctx) {
			return;
		}

		const key = mode == 'normal' ? mode + Math.round(progress * 4) : mode;

		if (key == sirenKey) {
			return;
		}

		sirenKey = key;

		if (!siren) {
			siren = {
				osc: ctx.createOscillator(),
				lfo: ctx.createOscillator(),
				depth: ctx.createGain(),
				gain: ctx.createGain()
			};

			siren.gain.gain.value = 0;
			siren.lfo.connect(siren.depth);
			siren.depth.connect(siren.osc.frequency);
			siren.osc.connect(siren.gain);
			siren.gain.connect(master);
			siren.osc.start();
			siren.lfo.start();
		}

		const t = ctx.currentTime;
		const config = SIRENS[mode];

		if (!config) {
			siren.gain.gain.setTargetAtTime(0, t, 0.02);
			return;
		}

		siren.osc.type = config.type;
		siren.osc.frequency.setTargetAtTime(config.base || 350 + Math.round(progress * 4) * 40, t, 0.02);
		siren.lfo.frequency.setTargetAtTime(config.rate, t, 0.02);
		siren.depth.gain.setTargetAtTime(config.depth, t, 0.02);
		siren.gain.gain.setTargetAtTime(config.volume, t, 0.02);
	}

	function toggleMute()
	{
		muted = !muted;

		try {
			localStorage.setItem('pacman.muted', muted ? '1' : '0');
		} catch (e) {
			// Sem localStorage a preferência vale só para esta sessão
		}

		if (ctx) {
			master.gain.setTargetAtTime(muted ? 0 : 0.25, ctx.currentTime, 0.02);
		}

		return muted;
	}

	// Com a aba escondida o jogo pausa, então o som também
	document.addEventListener('visibilitychange', function () {
		if (!ctx) {
			return;
		}

		if (document.hidden) {
			ctx.suspend();
		} else if (!held) {
			ctx.resume();
		}
	});

	return {
		unlock: unlock,
		hold: hold,
		play: play,
		setSiren: setSiren,
		toggleMute: toggleMute,
		isMuted: function () { return muted; }
	};
})();
