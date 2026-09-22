/**
 * Semantic MIDI Player - 乐器语言合成器语义 MIDI 播放模块
 * 
 * 功能：加载语义 MIDI 文件，解析为音符事件，使用当前乐器的
 * 采样/合成器进行播放。
 * 
 * 版本: v1.0.0
 */

(function(global) {
    'use strict';

    // ==================== 配置 ====================
    const SEMANTIC_MIDI_MAP = {
        '安慰': '../midis/comfort.mid',
        'comfort': '../midis/comfort.mid',
    };

    // 默认播放参数
    const DEFAULT_PARAMS = {
        duration: 2.0,      // 秒（当 MIDI 无 Note Off 时使用）
        velocity: 0.7,      // 演奏力度
        tempo: 120,         // BPM（当 MIDI 无速度事件时使用）
    };

    // ==================== MIDI 解析器 ====================

    /**
     * 读取 MIDI 变长数值
     */
    function readVarLength(data, pos) {
        let value = 0;
        while (true) {
            const byte = data[pos++];
            value = (value << 7) | (byte & 0x7F);
            if (!(byte & 0x80)) break;
        }
        return { value, pos };
    }

    /**
     * 解析 MIDI 文件
     * @param {ArrayBuffer} buffer - MIDI 文件数据
     * @returns {Object} 解析后的 MIDI 事件列表
     */
    function parseMidi(buffer) {
        const data = new Uint8Array(buffer);
        let pos = 0;

        // 读取 Header Chunk
        const headerChunk = readChunk(data, pos);
        if (headerChunk.type !== 'MThd') {
            throw new Error('Invalid MIDI file: missing MThd header');
        }
        pos = headerChunk.end;

        const formatType = readUInt16BE(headerChunk.data, 0);
        const numTracks = readUInt16BE(headerChunk.data, 2);
        const ticksPerQuarter = readUInt16BE(headerChunk.data, 4);

        const midi = {
            formatType,
            numTracks,
            ticksPerQuarter,
            tracks: [],
            tempo: 500000,      // 默认 120 BPM (μs/拍)
            timeSignature: { numerator: 4, denominator: 4 }
        };

        // 读取每个 Track Chunk
        for (let i = 0; i < numTracks; i++) {
            const trackChunk = readChunk(data, pos);
            if (trackChunk.type !== 'MTrk') {
                throw new Error(`Invalid track chunk at position ${pos}`);
            }
            pos = trackChunk.end;

            const track = parseTrack(trackChunk.data, midi.ticksPerQuarter);
            midi.tracks.push(track);

            // 提取全局事件（速度、拍号等）
            extractGlobalEvents(track, midi);
        }

        return midi;
    }

    function readChunk(data, pos) {
        const type = String.fromCharCode(data[pos], data[pos+1], data[pos+2], data[pos+3]);
        const length = readUInt32BE(data, pos + 4);
        const end = pos + 8 + length;
        return {
            type,
            length,
            data: data.slice(pos + 8, end),
            end
        };
    }

    function readUInt32BE(data, pos) {
        return (data[pos] << 24) | (data[pos+1] << 16) | (data[pos+2] << 8) | data[pos+3];
    }

    function readUInt16BE(data, pos) {
        return (data[pos] << 8) | data[pos+1];
    }

    function readUInt24BE(data, pos) {
        return (data[pos] << 16) | (data[pos+1] << 8) | data[pos+2];
    }

    /**
     * 解析单个 Track
     */
    function parseTrack(trackData, ticksPerQuarter) {
        const events = [];
        let pos = 0;
        let runningStatus = 0;

        while (pos < trackData.length) {
            // 读取 delta time
            const deltaResult = readVarLength(trackData, pos);
            const deltaTime = deltaResult.value;
            pos = deltaResult.pos;

            let status = trackData[pos];

            // Meta Event (0xFF)
            if (status === 0xFF) {
                pos++;
                const metaType = trackData[pos++];
                const lenResult = readVarLength(trackData, pos);
                const length = lenResult.value;
                pos = lenResult.pos;
                const metaData = trackData.slice(pos, pos + length);
                pos += length;

                events.push({
                    deltaTime,
                    type: 'meta',
                    metaType,
                    data: metaData
                });

                if (metaType === 0x2F) break; // End of Track
                continue;
            }

            // SysEx Event (0xF0, 0xF7)
            if (status === 0xF0 || status === 0xF7) {
                pos++;
                const lenResult = readVarLength(trackData, pos);
                const length = lenResult.value;
                pos = lenResult.pos;
                pos += length;
                events.push({ deltaTime, type: 'sysex' });
                continue;
            }

            // Running Status
            if ((status & 0x80) === 0) {
                status = runningStatus;
            } else {
                runningStatus = status;
                pos++;
            }

            const eventType = (status >> 4) & 0x0F;
            const channel = status & 0x0F;

            switch (eventType) {
                case 0x8: // Note Off
                case 0x9: // Note On
                    const note = trackData[pos++];
                    const velocity = trackData[pos++];
                    events.push({
                        deltaTime,
                        type: eventType === 0x9 ? 'noteOn' : 'noteOff',
                        channel,
                        note,
                        velocity
                    });
                    break;

                case 0xA: // Polyphonic Key Pressure
                    pos += 2;
                    break;

                case 0xB: // Control Change
                    pos += 2;
                    break;

                case 0xC: // Program Change
                    pos += 1;
                    break;

                case 0xD: // Channel Pressure
                    pos += 1;
                    break;

                case 0xE: // Pitch Bend
                    pos += 2;
                    break;

                default:
                    pos += 2;
                    break;
            }
        }

        return { events };
    }

    /**
     * 从 Track 提取全局事件（速度、拍号、调号等）
     */
    function extractGlobalEvents(track, midi) {
        for (const event of track.events) {
            if (event.type !== 'meta') continue;

            switch (event.metaType) {
                case 0x51: // Set Tempo
                    if (event.data.length === 3) {
                        midi.tempo = readUInt24BE(event.data, 0);
                    }
                    break;

                case 0x58: // Time Signature
                    if (event.data.length === 4) {
                        midi.timeSignature = {
                            numerator: event.data[0],
                            denominator: Math.pow(2, event.data[1])
                        };
                    }
                    break;

                case 0x59: // Key Signature
                    if (event.data.length === 2) {
                        midi.keySignature = {
                            key: event.data[0],
                            isMinor: event.data[1] !== 0
                        };
                    }
                    break;
            }
        }
    }

    // ==================== 音符工具 ====================

    const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    function midiNoteToName(noteNumber) {
        const octave = Math.floor(noteNumber / 12) - 1;
        const noteIndex = noteNumber % 12;
        return NOTE_NAMES[noteIndex] + octave;
    }

    function midiNoteToFrequency(noteNumber) {
        return 440 * Math.pow(2, (noteNumber - 69) / 12);
    }

    // ==================== 播放器 ====================

    /**
     * Semantic MIDI Player 类
     */
    class SemanticMidiPlayer {
        constructor() {
            this.loadedMidis = new Map();
            this.isPlaying = false;
            this.currentPlayback = null;
        }

        /**
         * 注册语义 MIDI 映射
         * @param {string} semantic - 语义名称（如 "安慰"）
         * @param {string} url - MIDI 文件 URL
         */
        register(semantic, url) {
            SEMANTIC_MIDI_MAP[semantic] = url;
            console.log(`[SemanticPlayer] 注册语义: "${semantic}" → ${url}`);
        }

        /**
         * 加载 MIDI 文件
         * @param {string} url - MIDI 文件 URL
         * @returns {Promise<Object>} 解析后的 MIDI 对象
         */
        async load(url) {
            if (this.loadedMidis.has(url)) {
                return this.loadedMidis.get(url);
            }

            console.log(`[SemanticPlayer] 加载 MIDI: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load MIDI: ${url} (${response.status})`);
            }

            const buffer = await response.arrayBuffer();
            const midi = parseMidi(buffer);
            this.loadedMidis.set(url, midi);

            console.log(`[SemanticPlayer] MIDI 解析完成:`, {
                tracks: midi.numTracks,
                format: midi.formatType,
                ticksPerQuarter: midi.ticksPerQuarter,
                tempo: Math.round(60000000 / midi.tempo) + ' BPM'
            });

            return midi;
        }

        /**
         * 获取语义对应的 MIDI URL
         * @param {string} semantic - 语义名称
         * @returns {string|null}
         */
        getUrl(semantic) {
            return SEMANTIC_MIDI_MAP[semantic] || null;
        }

        /**
         * 播放语义 MIDI
         * @param {string} semantic - 语义名称（如 "安慰"）
         * @param {Object} options - 播放选项
         * @returns {Promise<boolean>}
         */
        async play(semantic, options = {}) {
            const url = this.getUrl(semantic);
            if (!url) {
                console.warn(`[SemanticPlayer] 未知语义: "${semantic}"`);
                return false;
            }

            try {
                const midi = await this.load(url);
                await this.playMidi(midi, options);
                return true;
            } catch (err) {
                console.error(`[SemanticPlayer] 播放失败:`, err);
                return false;
            }
        }

        /**
         * 播放解析后的 MIDI 数据
         * @param {Object} midi - 解析后的 MIDI 对象
         * @param {Object} options - 播放选项
         *        - duration: 默认音符时长（秒，当 MIDI 无 Note Off 时）
         *        - velocity: 演奏力度 (0-1)
         *        - onNoteStart: 音符开始回调 (note, time)
         *        - onNoteEnd: 音符结束回调 (note, time)
         */
        async playMidi(midi, options = {}) {
            // 依赖外部全局变量：audioContext, currentInstrument, playTone
            if (!global.audioContext) {
                console.warn('[SemanticPlayer] audioContext 未初始化，请先启动音频引擎');
                return;
            }

            const opts = {
                duration: options.duration || DEFAULT_PARAMS.duration,
                velocity: options.velocity || DEFAULT_PARAMS.velocity,
                onNoteStart: options.onNoteStart || null,
                onNoteEnd: options.onNoteEnd || null,
            };

            this.isPlaying = true;

            // 计算速度
            const bpm = Math.round(60000000 / midi.tempo);
            const secondsPerTick = 60 / (bpm * midi.ticksPerQuarter);

            console.log(`[SemanticPlayer] 开始播放 MIDI (${bpm} BPM)`);

            // 收集所有音符事件并计算绝对时间
            const noteEvents = [];

            for (let trackIndex = 0; trackIndex < midi.tracks.length; trackIndex++) {
                const track = midi.tracks[trackIndex];
                let absoluteTick = 0;

                for (const event of track.events) {
                    absoluteTick += event.deltaTime;

                    if (event.type === 'noteOn' && event.velocity > 0) {
                        noteEvents.push({
                            track: trackIndex,
                            note: event.note,
                            velocity: event.velocity / 127,  // 归一化到 0-1
                            startTick: absoluteTick,
                            noteName: midiNoteToName(event.note),
                            frequency: midiNoteToFrequency(event.note),
                        });
                    } else if (event.type === 'noteOff' || 
                              (event.type === 'noteOn' && event.velocity === 0)) {
                        // 找到对应的 Note On 并设置结束时间
                        const matchingNote = noteEvents.find(n => 
                            n.track === trackIndex && 
                            n.note === event.note && 
                            !n.endTick
                        );
                        if (matchingNote) {
                            matchingNote.endTick = absoluteTick;
                        }
                    }
                }
            }

            // 为没有 Note Off 的音符设置默认时长
            for (const note of noteEvents) {
                if (!note.endTick) {
                    note.endTick = note.startTick + (opts.duration * midi.ticksPerQuarter / (60 / bpm));
                }
                note.duration = (note.endTick - note.startTick) * secondsPerTick;
                note.startTime = note.startTick * secondsPerTick;
            }

            // 按开始时间排序
            noteEvents.sort((a, b) => a.startTime - b.startTime);

            console.log(`[SemanticPlayer] 音符事件:`, noteEvents.map(n => ({
                note: n.noteName,
                freq: Math.round(n.frequency) + 'Hz',
                start: n.startTime.toFixed(2) + 's',
                duration: n.duration.toFixed(2) + 's',
                velocity: Math.round(n.velocity * 100) + '%'
            })));

            // 播放
            const startTime = global.audioContext.currentTime;

            for (const note of noteEvents) {
                if (!this.isPlaying) break;

                const playTime = startTime + note.startTime;
                const noteDuration = note.duration;
                const noteVelocity = note.velocity * opts.velocity;

                // 等待到播放时间
                const waitTime = (playTime - global.audioContext.currentTime) * 1000;
                if (waitTime > 0) {
                    await sleep(waitTime);
                }

                if (!this.isPlaying) break;

                // 调用外部播放函数
                if (typeof global.playTone === 'function') {
                    global.playTone(note.frequency, note.noteName, noteDuration * 1000, noteVelocity);
                } else if (typeof global.playSampleTone === 'function') {
                    global.playSampleTone(note.frequency, note.noteName, noteDuration, noteVelocity);
                } else if (typeof global.playSynthTone === 'function') {
                    global.playSynthTone(note.frequency, noteDuration, noteVelocity);
                } else {
                    console.warn('[SemanticPlayer] 未找到播放函数 (playTone/playSampleTone/playSynthTone)');
                }

                if (opts.onNoteStart) {
                    opts.onNoteStart(note, playTime);
                }

                // 如果有结束回调，设置定时器
                if (opts.onNoteEnd) {
                    setTimeout(() => {
                        if (this.isPlaying) opts.onNoteEnd(note, playTime + noteDuration);
                    }, noteDuration * 1000);
                }
            }

            this.isPlaying = false;
            console.log('[SemanticPlayer] MIDI 播放完成');
        }

        /**
         * 停止播放
         */
        stop() {
            this.isPlaying = false;
            console.log('[SemanticPlayer] 播放已停止');
        }
    }

    // ==================== 工具函数 ====================

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== 导出 ====================

    // 创建全局实例
    const semanticPlayer = new SemanticMidiPlayer();

    // 暴露到全局
    global.SemanticMidiPlayer = SemanticMidiPlayer;
    global.semanticPlayer = semanticPlayer;

    console.log('[SemanticPlayer] 语义 MIDI 播放器已加载 v1.0.0');
    console.log('[SemanticPlayer] 已注册语义:', Object.keys(SEMANTIC_MIDI_MAP));

})(window);
