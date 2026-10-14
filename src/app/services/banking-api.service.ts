import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

import { Account } from '../models/account.model';
import {
  Transaction,
  CreateTransactionRequest
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class BankingApiService {

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private get baseUrl(): string {
    return isPlatformBrowser(this.platformId)
      ? '/api'
      : 'http://localhost:8080/api';
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.baseUrl}/accounts`
    );
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${this.baseUrl}/transactions`
    );
  }

  createTransaction(
    request: CreateTransactionRequest
  ): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.baseUrl}/transactions`,
      request
    );
  }

  getTransactionByReference(
    reference: string
  ): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.baseUrl}/transactions/${encodeURIComponent(reference)}`
    );
  }
}