import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  PLATFORM_ID,
  Inject,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from './type';
import { ChatService } from './chat.service';
import { ChangeDetectorRef, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  readonly placeholderResponses: string[] = [
    'Certo! Posso aiutarti a esplorare le funzionalità di questa demo. 😊',
    'Interessante domanda! Fammi pensare un attimo...',
    'Ecco qualche spunto che potrebbe esserti utile.',
    'Ottima idea! Vediamo insieme i prossimi passi.',
  ];

  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content:
        'Ciao! Sono il tuo assistente virtuale. Fammi una domanda o raccontami cosa hai in mente. 🤖',
    },
  ];

  userInput = '';
  isTyping = false;
  chatTitle = 'Chat Base Demo';
  chatDescription = 'descrizione della chat';
  private scrollHandle: number | null = null;
  darkMode = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private chatService: ChatService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @Output() darkModeChange = new EventEmitter<boolean>();

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const root = document.documentElement; // seleziona :root
    if (this.darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.scrollHandle !== null) {
      cancelAnimationFrame(this.scrollHandle);
      this.scrollHandle = null;
    }
  }

  updateHistory(message: ChatMessage): void {
    this.messages.push(message);
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: this.userInput };
    this.updateHistory(userMsg);
    this.scrollToBottom();
    this.userInput = '';

    // Mostra subito il "typing"
    this.isTyping = true;
    this.cdr.detectChanges(); // aggiorna subito la UI

    this.chatService.sendThread(this.messages).subscribe({
      next: (response) => {
        this.updateHistory({ role: 'assistant', content: response.reply });

        // Aggiorna UI
        this.isTyping = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ChatComponent error:', error);
        this.updateHistory({
          role: 'assistant',
          content: 'Ops! Si è verificato un problema mentre rispondevo. Riprova tra poco.',
        });

        // Aggiorna UI immediatamente usando NgZone
        this.ngZone.run(() => {
          this.isTyping = false;
          this.scrollToBottom();
          this.cdr.detectChanges();
        });
      },
    });
  }


  private getAssistantResponse(): string {
    if (!this.placeholderResponses.length) {
      return 'Ops! Non ho trovato una risposta pronta, ma continua pure a scrivermi.';
    }

    const randomIndex = Math.floor(Math.random() * this.placeholderResponses.length);
    return this.placeholderResponses[randomIndex];
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return;
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.scrollHandle !== null) {
      cancelAnimationFrame(this.scrollHandle);
    }

    this.scrollHandle = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      this.scrollHandle = null;
    });
  }
}
