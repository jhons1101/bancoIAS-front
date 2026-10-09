import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  private readonly baseUrl = 'http://localhost:8080/api';

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