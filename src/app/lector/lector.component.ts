import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';

export type ReadingStatus =
  | 'pending'
  | 'current'
  | 'correct'
  | 'incorrect'
  | 'skipped';

export interface SyllableView {
  text: string;
  status: ReadingStatus;
}

export interface ReadingWordView {
  text: string;
  normalized: string;
  heard?: string;
  status: ReadingStatus;
  syllables: SyllableView[];
}

export interface ReadingEvaluation {
  words: ReadingWordView[];
  extraHeardWords: string[];
}

interface AlignmentStep {
  expectedIndex?: number;
  heardIndex?: number;
  operation: 'match' | 'substitute' | 'delete' | 'insert';
}

interface RecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface RecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: RecognitionAlternativeLike;
}

interface RecognitionEventLike {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    readonly [index: number]: RecognitionResultLike;
  };
}

interface RecognitionErrorEventLike {
  readonly error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

const VOWELS = 'aeiouáéíóúü';
const STRONG_VOWELS = 'aeoáéó';
const ACCENTED_WEAK_VOWELS = 'íú';
const VALID_ONSETS = new Set([
  'bl',
  'br',
  'ch',
  'cl',
  'cr',
  'dr',
  'fl',
  'fr',
  'gl',
  'gr',
  'll',
  'pl',
  'pr',
  'rr',
  'tr'
]);

/**
 * Normaliza para comparar lo leído, sin penalizar mayúsculas, puntuación
 * ni tildes que el motor de voz puede omitir. La ñ se conserva.
 */
export function normalizeForComparison(text: string): string {
  const protectedEnye = text.toLocaleLowerCase('es-CL').replace(/ñ/g, '\uE000');

  return protectedEnye
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\uE000/g, 'ñ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function isVowel(character: string): boolean {
  return VOWELS.includes(character.toLocaleLowerCase('es-CL'));
}

function formsHiatus(first: string, second: string): boolean {
  const a = first.toLocaleLowerCase('es-CL');
  const b = second.toLocaleLowerCase('es-CL');

  return (
    (STRONG_VOWELS.includes(a) && STRONG_VOWELS.includes(b)) ||
    ACCENTED_WEAK_VOWELS.includes(a) ||
    ACCENTED_WEAK_VOWELS.includes(b)
  );
}

/**
 * Silabificador liviano para palabras españolas comunes.
 * No pretende reemplazar un analizador fonológico profesional, pero permite
 * ofrecer retroalimentación como TE/CHO frente a LE/CHO sin dependencias.
 */
export function syllabifySpanish(word: string): string[] {
  const cleanWord = word
    .toLocaleLowerCase('es-CL')
    .replace(/[^\p{L}\p{N}]/gu, '');

  if (!cleanWord || ![...cleanWord].some(isVowel)) {
    return cleanWord ? [cleanWord] : [];
  }

  const characters = [...cleanWord];
  const nuclei: Array<{ start: number; end: number }> = [];

  for (let index = 0; index < characters.length; index++) {
    if (!isVowel(characters[index])) {
      continue;
    }

    const start = index;
    let end = index;

    while (
      end + 1 < characters.length &&
      isVowel(characters[end + 1]) &&
      !formsHiatus(characters[end], characters[end + 1])
    ) {
      end++;
    }

    nuclei.push({ start, end });
    index = end;
  }

  if (nuclei.length <= 1) {
    return [cleanWord];
  }

  const boundaries: number[] = [];

  for (let index = 0; index < nuclei.length - 1; index++) {
    const currentNucleus = nuclei[index];
    const nextNucleus = nuclei[index + 1];
    const consonantStart = currentNucleus.end + 1;
    const consonantEnd = nextNucleus.start;
    const consonantCount = consonantEnd - consonantStart;
    let boundary = consonantStart;

    if (consonantCount === 1) {
      boundary = consonantStart;
    } else if (consonantCount === 2) {
      const cluster = characters
        .slice(consonantStart, consonantEnd)
        .join('')
        .toLocaleLowerCase('es-CL');
      boundary = VALID_ONSETS.has(cluster)
        ? consonantStart
        : consonantStart + 1;
    } else if (consonantCount >= 3) {
      const lastTwo = characters
        .slice(consonantEnd - 2, consonantEnd)
        .join('')
        .toLocaleLowerCase('es-CL');
      boundary = VALID_ONSETS.has(lastTwo)
        ? consonantEnd - 2
        : consonantEnd - 1;
    }

    boundaries.push(boundary);
  }

  const syllables: string[] = [];
  let start = 0;

  for (const boundary of boundaries) {
    if (boundary > start) {
      syllables.push(characters.slice(start, boundary).join(''));
      start = boundary;
    }
  }

  syllables.push(characters.slice(start).join(''));
  return syllables.filter(Boolean);
}

function tokenize(text: string): string[] {
  const normalized = normalizeForComparison(text);
  return normalized ? normalized.split(' ') : [];
}

function alignSequences(expected: string[], heard: string[]): AlignmentStep[] {
  const rows = expected.length + 1;
  const columns = heard.length + 1;
  const costs = Array.from({ length: rows }, () =>
    Array<number>(columns).fill(0)
  );

  for (let row = 0; row < rows; row++) {
    costs[row][0] = row;
  }

  for (let column = 0; column < columns; column++) {
    costs[0][column] = column;
  }

  for (let row = 1; row < rows; row++) {
    for (let column = 1; column < columns; column++) {
      const substitutionCost =
        expected[row - 1] === heard[column - 1] ? 0 : 1;

      costs[row][column] = Math.min(
        costs[row - 1][column - 1] + substitutionCost,
        costs[row - 1][column] + 1,
        costs[row][column - 1] + 1
      );
    }
  }

  const alignment: AlignmentStep[] = [];
  let row = expected.length;
  let column = heard.length;

  while (row > 0 || column > 0) {
    if (row > 0 && column > 0) {
      const isMatch = expected[row - 1] === heard[column - 1];
      const diagonalCost = costs[row - 1][column - 1] + (isMatch ? 0 : 1);

      // Se prioriza la diagonal en empates para mantener juntas palabras
      // semejantes, como TECHO/LECHO.
      if (costs[row][column] === diagonalCost) {
        alignment.push({
          expectedIndex: row - 1,
          heardIndex: column - 1,
          operation: isMatch ? 'match' : 'substitute'
        });
        row--;
        column--;
        continue;
      }
    }

    if (row > 0 && costs[row][column] === costs[row - 1][column] + 1) {
      alignment.push({
        expectedIndex: row - 1,
        operation: 'delete'
      });
      row--;
      continue;
    }

    alignment.push({
      heardIndex: column - 1,
      operation: 'insert'
    });
    column--;
  }

  return alignment.reverse();
}

function extractDisplayWord(token: string): {
  prefix: string;
  core: string;
  suffix: string;
} {
  const match = token.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}]+)([^\p{L}\p{N}]*)$/u);

  return match
    ? { prefix: match[1], core: match[2], suffix: match[3] }
    : { prefix: '', core: token, suffix: '' };
}

function buildExpectedWords(targetText: string): ReadingWordView[] {
  return targetText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const { prefix, core, suffix } = extractDisplayWord(token);
      const syllables = syllabifySpanish(core);
      const displaySyllables = syllables.length ? syllables : [core];

      if (displaySyllables.length) {
        displaySyllables[0] = `${prefix}${displaySyllables[0]}`;
        displaySyllables[displaySyllables.length - 1] =
          `${displaySyllables[displaySyllables.length - 1]}${suffix}`;
      }

      return {
        text: token,
        normalized: normalizeForComparison(core),
        status: 'pending' as ReadingStatus,
        syllables: displaySyllables.map((text) => ({
          text,
          status: 'pending' as ReadingStatus
        }))
      };
    });
}

function evaluateSyllables(
  expectedWord: ReadingWordView,
  heardWord: string
): SyllableView[] {
  const expected = expectedWord.syllables.map((syllable) =>
    normalizeForComparison(syllable.text)
  );
  const heard = syllabifySpanish(heardWord).map(normalizeForComparison);
  const alignment = alignSequences(expected, heard);

  return expectedWord.syllables.map((syllable, expectedIndex) => {
    const step = alignment.find(
      (item) => item.expectedIndex === expectedIndex
    );

    return {
      text: syllable.text,
      status:
        step?.operation === 'match'
          ? 'correct'
          : step?.operation === 'delete'
            ? 'skipped'
            : 'incorrect'
    };
  });
}

/**
 * Compara la lectura completa y devuelve estados listos para representar.
 * interimTranscript se muestra como "current": nunca se marca rojo hasta
 * que el motor confirme el resultado.
 */
export function evaluateReading(
  targetText: string,
  finalTranscript: string,
  interimTranscript = '',
  finished = false
): ReadingEvaluation {
  const words = buildExpectedWords(targetText);
  const expected = words.map((word) => word.normalized);
  const finalWords = tokenize(finalTranscript);
  const interimWords = tokenize(interimTranscript);
  const heard = [...finalWords, ...interimWords];
  const alignment = alignSequences(expected, heard);
  const extraHeardWords: string[] = [];

  alignment.forEach((step, alignmentIndex) => {
    if (step.operation === 'insert' && step.heardIndex !== undefined) {
      if (step.heardIndex < finalWords.length || finished) {
        extraHeardWords.push(heard[step.heardIndex]);
      }
      return;
    }

    if (step.expectedIndex === undefined) {
      return;
    }

    const word = words[step.expectedIndex];

    if (step.operation === 'delete') {
      const hasLaterConfirmedWord = alignment
        .slice(alignmentIndex + 1)
        .some(
          (laterStep) =>
            laterStep.heardIndex !== undefined &&
            laterStep.heardIndex < finalWords.length
        );

      if (finished || hasLaterConfirmedWord) {
        word.status = 'skipped';
        word.syllables = word.syllables.map((syllable) => ({
          ...syllable,
          status: 'skipped'
        }));
      }
      return;
    }

    if (step.heardIndex === undefined) {
      return;
    }

    const isConfirmed = step.heardIndex < finalWords.length;
    const heardWord = heard[step.heardIndex];
    word.heard = heardWord;

    if (!isConfirmed && !finished) {
      word.status = 'current';
      word.syllables = word.syllables.map((syllable) => ({
        ...syllable,
        status: 'current'
      }));
      return;
    }

    if (step.operation === 'match') {
      word.status = 'correct';
      word.syllables = word.syllables.map((syllable) => ({
        ...syllable,
        status: 'correct'
      }));
      return;
    }

    word.status = 'incorrect';
    word.syllables = evaluateSyllables(word, heardWord);
  });

  return { words, extraHeardWords };
}

@Component({
  selector: 'app-lector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lector.component.html',
  styleUrls: ['./lector.component.css']
})
export class LectorComponent implements OnDestroy {
  readonly practiceTexts = [
    'CASA',
    'EL PERRO CORRE',
    'LA GATA SALTÓ AL TECHO',
    'EL SOL BRILLA',
    'LA LUNA ILUMINA EL AGUA'
  ];

  currentTextIndex = 0;
  currentText = this.practiceTexts[0];
  wordViews: ReadingWordView[] = [];
  extraHeardWords: string[] = [];

  isListening = false;
  speechSupported = true;
  sessionFinished = false;
  showSummary = false;
  finalTranscript = '';
  interimTranscript = '';
  errorMessage = '';
  noticeMessage = '';
  recognitionConfidence: number | null = null;

  private recognition?: SpeechRecognitionLike;
  private keepListening = false;
  private restartTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.updateEvaluation();
    this.initSpeechRecognition();
  }

  get recognizedText(): string {
    return [this.finalTranscript, this.interimTranscript]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  get correctWords(): number {
    return this.wordViews.filter((word) => word.status === 'correct').length;
  }

  get reviewedWords(): number {
    return this.wordViews.filter((word) =>
      ['correct', 'incorrect', 'skipped'].includes(word.status)
    ).length;
  }

  get accuracy(): number {
    return this.reviewedWords
      ? Math.round((this.correctWords / this.reviewedWords) * 100)
      : 0;
  }

  get score(): number {
    return this.accuracy;
  }

  get currentWord(): string {
    return this.currentText;
  }

  get showFeedback(): boolean {
    return this.showSummary || Boolean(this.errorMessage);
  }

  get isCorrect(): boolean {
    return this.accuracy >= 80;
  }

  nextWord(): void {
    this.nextText();
  }

  get feedbackWords(): ReadingWordView[] {
    return this.wordViews.filter((word) =>
      ['incorrect', 'skipped'].includes(word.status)
    );
  }

  get statusText(): string {
    if (this.errorMessage) {
      return 'Necesito tu atención';
    }

    if (this.isListening) {
      return 'Te estoy escuchando';
    }

    if (this.showSummary) {
      return this.feedbackWords.length
        ? 'Lectura terminada: revisemos'
        : 'Lectura terminada';
    }

    return 'Lista para comenzar';
  }

  toggleListening(): void {
    if (this.isListening || this.keepListening) {
      this.finishReading();
    } else {
      this.startListening();
    }
  }

  startListening(): void {
    if (!this.speechSupported || !this.recognition) {
      this.errorMessage =
        'Este navegador no ofrece reconocimiento de voz. Prueba con una versión reciente de Chrome o Edge.';
      return;
    }

    this.cancelRecognition();
    this.resetAttempt();
    this.keepListening = true;
    this.noticeMessage = 'Habla con claridad y a una distancia cómoda del micrófono.';
    this.startRecognitionEngine();
  }

  finishReading(): void {
    this.keepListening = false;
    this.sessionFinished = true;
    this.isListening = false;
    this.showSummary = Boolean(this.finalTranscript.trim());
    this.interimTranscript = '';

    try {
      this.recognition?.stop();
    } catch {
      // El motor ya podía haberse detenido por silencio.
    }

    this.updateEvaluation();

    if (!this.finalTranscript.trim()) {
      this.noticeMessage =
        'No alcancé a reconocer palabras. Puedes acercarte al micrófono e intentarlo otra vez.';
    } else {
      this.noticeMessage = '';
    }
  }

  retryReading(): void {
    this.cancelRecognition();
    this.resetAttempt();
    this.keepListening = true;
    this.noticeMessage = 'Intento nuevo. Comienza cuando veas el micrófono activo.';
    this.restartTimer = setTimeout(() => this.startRecognitionEngine(), 200);
  }

  nextText(): void {
    this.cancelRecognition();
    this.currentTextIndex =
      (this.currentTextIndex + 1) % this.practiceTexts.length;
    this.currentText = this.practiceTexts[this.currentTextIndex];
    this.resetAttempt();
  }

  previousText(): void {
    this.cancelRecognition();
    this.currentTextIndex =
      (this.currentTextIndex - 1 + this.practiceTexts.length) %
      this.practiceTexts.length;
    this.currentText = this.practiceTexts[this.currentTextIndex];
    this.resetAttempt();
  }

  listenExample(): void {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      this.noticeMessage =
        'Tu navegador no permite reproducir el ejemplo de voz.';
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.currentText);
    utterance.lang = 'es-CL';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }

  wordStatusLabel(word: ReadingWordView): string {
    const labels: Record<ReadingStatus, string> = {
      pending: 'pendiente',
      current: 'escuchando',
      correct: 'correcta',
      incorrect: 'por revisar',
      skipped: 'omitida'
    };

    return `${word.text}: ${labels[word.status]}`;
  }

  trackWord(index: number): number {
    return index;
  }

  trackSyllable(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.cancelRecognition();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') {
      this.speechSupported = false;
      return;
    }

    const browserWindow = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const RecognitionConstructor =
      browserWindow.SpeechRecognition ??
      browserWindow.webkitSpeechRecognition;

    if (!RecognitionConstructor) {
      this.speechSupported = false;
      return;
    }

    this.recognition = new RecognitionConstructor();
    this.recognition!.lang = 'es-CL';
    this.recognition!.continuous = true;
    this.recognition!.interimResults = true;
    this.recognition!.maxAlternatives = 1;

    this.recognition!.onstart = () => {
      this.isListening = true;
      this.errorMessage = '';
    };

    this.recognition!.onresult = (event: RecognitionEventLike) => {
      let finalChunk = '';
      let interimChunk = '';
      let confidence: number | null = null;

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const result = event.results[index];
        const alternative = result[0];

        if (result.isFinal) {
          finalChunk += ` ${alternative.transcript}`;
          confidence = alternative.confidence || null;
        } else {
          interimChunk += ` ${alternative.transcript}`;
        }
      }

      if (finalChunk.trim()) {
        this.finalTranscript = `${this.finalTranscript} ${finalChunk}`
          .trim()
          .replace(/\s+/g, ' ');
      }

      this.interimTranscript = interimChunk.trim();
      this.recognitionConfidence = confidence;
      this.updateEvaluation();

      const readingComplete = this.wordViews.every((word) =>
        ['correct', 'incorrect', 'skipped'].includes(word.status)
      );

      if (readingComplete && this.finalTranscript.trim()) {
        this.finishReading();
      }
    };

    this.recognition!.onerror = (event: RecognitionErrorEventLike) => {
      if (event.error === 'aborted' && !this.keepListening) {
        return;
      }

      const messages: Record<string, string> = {
        'not-allowed':
          'No tengo permiso para usar el micrófono. Habilítalo en la configuración del navegador.',
        'service-not-allowed':
          'El navegador bloqueó el servicio de reconocimiento de voz.',
        'audio-capture':
          'No encontré un micrófono disponible. Revisa que esté conectado y habilitado.',
        network:
          'El servicio de reconocimiento no está disponible en este momento.',
        'no-speech':
          'No escuché palabras. Habla un poco más cerca del micrófono.'
      };

      this.errorMessage =
        messages[event.error] ??
        'Ocurrió un problema al escuchar. Puedes volver a intentarlo.';

      if (event.error !== 'no-speech') {
        this.keepListening = false;
        this.isListening = false;
      }
    };

    this.recognition!.onend = () => {
      this.isListening = false;

      if (this.keepListening && !this.sessionFinished) {
        this.restartTimer = setTimeout(
          () => this.startRecognitionEngine(),
          250
        );
      }
    };
  }

  private startRecognitionEngine(): void {
    if (!this.recognition || !this.keepListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch {
      this.errorMessage =
        'El micrófono todavía se está preparando. Espera un momento y vuelve a intentarlo.';
      this.keepListening = false;
      this.isListening = false;
    }
  }

  private resetAttempt(): void {
    this.sessionFinished = false;
    this.showSummary = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.extraHeardWords = [];
    this.errorMessage = '';
    this.noticeMessage = '';
    this.recognitionConfidence = null;
    this.updateEvaluation();
  }

  private cancelRecognition(): void {
    this.keepListening = false;
    this.isListening = false;

    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = undefined;
    }

    try {
      this.recognition?.abort();
    } catch {
      // No hay una sesión activa que cancelar.
    }
  }

  private updateEvaluation(): void {
    const evaluation = evaluateReading(
      this.currentText,
      this.finalTranscript,
      this.interimTranscript,
      this.sessionFinished
    );

    this.wordViews = evaluation.words;
    this.extraHeardWords = evaluation.extraHeardWords;
  }
}