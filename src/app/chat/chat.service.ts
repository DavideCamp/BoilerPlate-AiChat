import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ChatMessage, ChatResponse } from './type';


@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = '/api/chat'; 
  constructor(private http: HttpClient) {}

  /**
   * Sends the full message thread to the backend and returns the assistant's reply.
   * @param messages Full chat history
   */


  sendThread(messages: ChatMessage[]): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { messages }).pipe(
      catchError((error) => {
        console.error('ChatService error:', error);
        return throwError(() => new Error('Failed to get a response from the assistant.'));
      })
    );
  }
}
