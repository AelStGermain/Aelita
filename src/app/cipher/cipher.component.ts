import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cipher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cipher.component.html',
  styleUrls: ['./cipher.component.css']
})
export class CipherComponent {
  inputText: string = '';
  outputText: string = '';
  selectedCipher: string = 'caesar';
  caesarShift: number = 3;
  vigenereKey: string = 'KEY';
  transformSteps: string[] = [];
  showSteps: boolean = false;

  cipherTypes = [
    { id: 'caesar', name: 'CIFRADO CÉSAR', icon: '🔐', description: 'Desplaza cada letra N posiciones' },
    { id: 'vigenere', name: 'CIFRADO VIGENÈRE', icon: '🔑', description: 'Sustitución polialfabética usando una clave' },
    { id: 'rot13', name: 'ROT13', icon: '🔄', description: 'Caso especial de César con desplazamiento 13' },
    { id: 'base64', name: 'BASE64', icon: '📦', description: 'Esquema de codificación binario a texto' },
    { id: 'sha256', name: 'SHA-256', icon: '🔒', description: 'Función hash criptográfica (unidireccional)' }
  ];

  selectCipher(type: string) {
    this.selectedCipher = type;
    this.outputText = '';
    this.transformSteps = [];
  }

  encrypt() {
    this.transformSteps = [];
    this.showSteps = true;

    switch (this.selectedCipher) {
      case 'caesar':
        this.outputText = this.caesarCipher(this.inputText, this.caesarShift);
        break;
      case 'vigenere':
        this.outputText = this.vigenereCipher(this.inputText, this.vigenereKey, true);
        break;
      case 'rot13':
        this.outputText = this.rot13(this.inputText);
        break;
      case 'base64':
        this.outputText = this.base64Encode(this.inputText);
        break;
      case 'sha256':
        this.sha256Hash(this.inputText);
        break;
    }
  }

  decrypt() {
    this.transformSteps = [];
    this.showSteps = true;

    switch (this.selectedCipher) {
      case 'caesar':
        this.outputText = this.caesarCipher(this.inputText, -this.caesarShift);
        break;
      case 'vigenere':
        this.outputText = this.vigenereCipher(this.inputText, this.vigenereKey, false);
        break;
      case 'rot13':
        this.outputText = this.rot13(this.inputText);
        break;
      case 'base64':
        this.outputText = this.base64Decode(this.inputText);
        break;
      case 'sha256':
        this.outputText = 'SHA-256 es una función hash unidireccional. ¡No se puede descifrar!';
        break;
    }
  }

  // Caesar Cipher Implementation
  caesarCipher(text: string, shift: number): string {
    let result = '';
    this.transformSteps.push(`Iniciando Cifrado César con desplazamiento: ${shift}`);

    for (let i = 0; i < text.length; i++) {
      let char = text[i];

      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        const isUpperCase = char === char.toUpperCase();
        const base = isUpperCase ? 65 : 97;

        const shifted = ((code - base + shift + 26) % 26) + base;
        const newChar = String.fromCharCode(shifted);

        this.transformSteps.push(`${char} → ${newChar} (desplazamiento ${shift})`);
        result += newChar;
      } else {
        result += char;
      }
    }

    return result;
  }

  // Vigenère Cipher Implementation
  vigenereCipher(text: string, key: string, encrypt: boolean): string {
    if (!key) return text;

    let result = '';
    let keyIndex = 0;
    const normalizedKey = key.toUpperCase();

    this.transformSteps.push(`Usando clave Vigenère: ${normalizedKey}`);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const base = isUpperCase ? 65 : 97;
        const charCode = text.charCodeAt(i) - base;
        const keyChar = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 65;

        const shift = encrypt ? keyChar : -keyChar;
        const newCode = ((charCode + shift + 26) % 26) + base;
        const newChar = String.fromCharCode(newCode);

        this.transformSteps.push(`${char} + ${normalizedKey[keyIndex % normalizedKey.length]} → ${newChar}`);
        result += newChar;
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  }

  // ROT13 Implementation
  rot13(text: string): string {
    this.transformSteps.push('Aplicando ROT13 (César con desplazamiento 13)');
    return this.caesarCipher(text, 13);
  }

  // Base64 Encoding
  base64Encode(text: string): string {
    try {
      this.transformSteps.push('Codificando a Base64...');
      const encoded = btoa(unescape(encodeURIComponent(text)));
      this.transformSteps.push(`Bytes originales: ${text.length}`);
      this.transformSteps.push(`Longitud codificada: ${encoded.length}`);
      return encoded;
    } catch (e) {
      return 'Error codificando a Base64';
    }
  }

  // Base64 Decoding
  base64Decode(text: string): string {
    try {
      this.transformSteps.push('Decodificando de Base64...');
      const decoded = decodeURIComponent(escape(atob(text)));
      this.transformSteps.push(`Decodificado exitosamente`);
      return decoded;
    } catch (e) {
      return 'Error: Cadena Base64 inválida';
    }
  }

  // SHA-256 Hash (using Web Crypto API)
  async sha256Hash(text: string) {
    this.transformSteps.push('Calculando hash SHA-256...');

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      this.transformSteps.push(`Entrada: "${text}"`);
      this.transformSteps.push(`Longitud del hash: 256 bits (64 caracteres hex)`);
      this.transformSteps.push(`¡Esta es una función UNIDIRECCIONAL!`);

      this.outputText = hashHex;
    } catch (e) {
      this.outputText = 'Error calculando hash';
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ ¡Copiado al portapapeles!');
    });
  }

  swapTexts() {
    const temp = this.inputText;
    this.inputText = this.outputText;
    this.outputText = temp;
  }

  clearAll() {
    this.inputText = '';
    this.outputText = '';
    this.transformSteps = [];
  }

  getCurrentCipherName(): string {
    const cipher = this.cipherTypes.find(c => c.id === this.selectedCipher);
    return cipher ? cipher.name : '';
  }

  getCurrentCipherDescription(): string {
    const cipher = this.cipherTypes.find(c => c.id === this.selectedCipher);
    return cipher ? cipher.description : '';
  }

  getEducationalInfo(): string {
    const info: { [key: string]: string } = {
      caesar: '<p><strong>Cifrado César</strong> fue usado por Julio César para proteger mensajes militares. Es una de las técnicas de cifrado más simples, desplazando cada letra un número fijo de posiciones.</p>',
      vigenere: '<p><strong>Cifrado Vigenère</strong> ¡fue considerado indescifrable durante siglos! Usa una palabra clave para crear múltiples cifrados César, haciendo el análisis de frecuencia mucho más difícil.</p>',
      rot13: '<p><strong>ROT13</strong> es un caso especial del cifrado César con un desplazamiento de 13. Dado que el alfabeto tiene 26 letras, ¡aplicar ROT13 dos veces devuelve el texto original!</p>',
      base64: '<p><strong>Base64</strong> ¡no es cifrado! Es un esquema de codificación usado para representar datos binarios en formato de texto ASCII. Comúnmente usado en adjuntos de correo y URLs de datos.</p>',
      sha256: '<p><strong>SHA-256</strong> es una función hash criptográfica que produce una salida de 256 bits (64 caracteres hex). Es unidireccional: ¡no puedes revertirla! Usada para almacenamiento de contraseñas y blockchain.</p>'
    };
    return info[this.selectedCipher] || '';
  }

  closeSteps() {
    this.showSteps = false;
  }
}
