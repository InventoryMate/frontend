import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  show() {
    console.log('Loading iniciado...');
    this.isLoadingSubject.next(true);
  }

  hide() {
    console.log('Loading finalizado...');
    this.isLoadingSubject.next(false);
  }
}
