import { Component, ElementRef, signal, ViewChild, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat-service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-simple-chat',
  imports: [MatCardModule, MatToolbarModule, MatInputModule, MatButtonModule, MatIconModule, FormsModule, NgClass],
  templateUrl: './simple-chat.html',
  styleUrls: ['./simple-chat.scss'],
})
export class SimpleChat {

  @ViewChild('chatHistory')
  private chatHistory! : ElementRef;

  private ChatService = inject(ChatService);

  userInput = '';
  isLoading = false;

  local = false;

  messages = signal([{text: 'Hello, how can I help you today?', isBot: true}]);

  sendMessage(){
    this.trimUserMessage();
    if(this.userInput !== '' && !this.isLoading){
      this.updateMessages(this.userInput);
      this.isLoading = true;
      if(this.local){
        this.simulateBotResponse();
      }else{
        this.sendChatMessage();
      }
    }
  }

  private sendChatMessage(){
      this.ChatService.sendChatMessage(this.userInput)
      .pipe(
        catchError(() => {this.updateMessages('Sorry, there was an error processing your request.', true);
          this.isLoading = false;
          return throwError ( () => new Error('Chat message failed to send'));
        })
      )
      .subscribe(response =>{
        this.updateMessages(response.message, true);
        this.userInput = '';
        this.isLoading = false;
      });
    }

  private updateMessages(newMessage: string, isBot: boolean = false){
    this.messages.update(messages => [...messages, {text: newMessage, isBot: isBot}]);
     this.scrollToBottom();
  }

  private trimUserMessage(){
    this.userInput = this.userInput.trim();
  }

  private simulateBotResponse(){
    setTimeout(() => {
      const response = 'This is a simulated bot response.';
      this.updateMessages(response, true);
      this.userInput = '';
      this.isLoading = false;
    }, 2000);
  }

  private scrollToBottom(){
    try{
      this.chatHistory.nativeElement.scrollTop = this.chatHistory.nativeElement.scrollHeight;
    }catch(err){

    }
  }
}
