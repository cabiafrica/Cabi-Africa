import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as CryptoJS from 'crypto-js';
import * as qs from 'qs';
import {
  MpesaConfig,
  MpesaEnvironment,
  StkPushRequest,
  StkPushResponse,
  StkCallback,
  C2BRegisterRequest,
  C2BRegisterResponse,
  B2CRequest,
  B2CResponse,
  B2CCallback,
  TransactionType,
  TransactionStatus,
  TransactionRecord,
  MpesaApiResponse,
} from './mpesa.types';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly http: AxiosInstance;
  private config: MpesaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private transactions: Map<string, TransactionRecord> = new Map();

  constructor() {
    this.config = this.loadConfig();
    this.http = this.createHttpClient();
  }

  private loadConfig(): MpesaConfig {
    const env = process.env.MPESA_ENV || 'sandbox';
    return {
      environment: env as MpesaEnvironment,
      shortCode: process.env.MPESA_SHORT_CODE || '',
      initiatorName: process.env.MPESA_INITIATOR_NAME || '',
      securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      callbackUrl: process.env.MPESA_CALLBACK_URL || '',
      timeoutUrl: process.env.MPESA_TIMEOUT_URL || '',
      resultUrl: process.env.MPESA_RESULT_URL || '',
    };
  }

  private createHttpClient(): AxiosInstance {
    const baseURL =
      this.config.environment === MpesaEnvironment.PRODUCTION
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    return axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const url = '/oauth/v1/generate?grant_type=client_credentials';
    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64');

    try {
      const response = await this.http.get<{ access_token: string; expires_in: number }>(url, {
        headers: { Authorization: `Basic ${auth}` },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000 - 60000);

      this.logger.log('M-Pesa access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', error);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const data = this.config.shortCode + this.config.passkey + timestamp;
    return Buffer.from(data).toString('base64');
  }

  async initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    const token = await this.getAccessToken();
    const password = this.generatePassword();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: TransactionType.STK_PUSH,
      Amount: Math.ceil(request.amount),
      PartyA: this.sanitizePhoneNumber(request.phoneNumber),
      PartyB: this.config.shortCode,
      PhoneNumber: this.sanitizePhoneNumber(request.phoneNumber),
      CallBackURL: request.callbackUrl || this.config.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    try {
      const response = await this.http.post<StkPushResponse>(
        '/mpesa/stkpush/v1/processrequest',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.logger.log(`STK Push initiated: ${response.data.CheckoutRequestID}`);

      const transaction: TransactionRecord = {
        id: response.data.CheckoutRequestID || `tx_${Date.now()}`,
        transactionType: TransactionType.STK_PUSH,
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        accountReference: request.accountReference,
        transactionId: response.data.CheckoutRequestID,
        status: TransactionStatus.PENDING,
        description: request.transactionDesc,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.transactions.set(transaction.id, transaction);

      return response.data;
    } catch (error: any) {
      this.logger.error('STK Push failed', error.response?.data || error.message);
      throw new Error(`STK Push failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  async queryStkStatus(checkoutRequestId: string): Promise<any> {
    const token = await this.getAccessToken();
    const password = this.generatePassword();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    try {
      const response = await this.http.post(
        '/mpesa/stkpushquery/v1/query',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('STK Query failed', error.response?.data || error.message);
      throw new Error(`STK Query failed: ${error.message}`);
    }
  }

  handleStkCallback(callback: StkCallback): TransactionRecord | null {
    this.logger.log('Processing STK Callback', callback);

    const transactionId = callback.CheckoutRequestID;
    const existingTransaction = this.transactions.get(transactionId);

    if (!existingTransaction) {
      this.logger.warn(`Transaction not found: ${transactionId}`);
      return null;
    }

    const isSuccess = callback.ResultCode === 0;
    existingTransaction.status = isSuccess ? TransactionStatus.COMPLETED : TransactionStatus.FAILED;
    existingTransaction.description = callback.ResultDesc;
    existingTransaction.updatedAt = new Date();

    if (callback.CallbackMetadata) {
      const getValue = (name: string): string | number | undefined => {
        const item = callback.CallbackMetadata.Item.find(i => i.Name === name);
        return item?.Value;
      };

      existingTransaction.transactionId = String(getValue('MpesaReceiptNumber'));
      existingTransaction.amount = Number(getValue('Amount'));
    }

    this.transactions.set(transactionId, existingTransaction);

    this.logger.log(
      `Transaction ${transactionId} updated to ${existingTransaction.status}`
    );

    return existingTransaction;
  }

  async registerC2BUrls(request: C2BRegisterRequest): Promise<C2BRegisterResponse> {
    const token = await this.getAccessToken();

    const payload = {
      ShortCode: request.shortCode || this.config.shortCode,
      ResponseType: request.responseType,
      ConfirmationURL: request.confirmationURL,
      ValidationURL: request.validationURL,
    };

    try {
      const response = await this.http.post<C2BRegisterResponse>(
        '/mpesa/c2b/v1/registerurl',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.logger.log('C2B URLs registered successfully');
      return response.data;
    } catch (error: any) {
      this.logger.error('C2B registration failed', error.response?.data || error.message);
      throw new Error(`C2B registration failed: ${error.message}`);
    }
  }

  handleC2BConfirmation(callback: any): TransactionRecord {
    this.logger.log('Processing C2B Confirmation', callback);

    const transaction: TransactionRecord = {
      id: callback.TransID || `c2b_${Date.now()}`,
      transactionType: TransactionType.C2B,
      amount: Number(callback.TransAmount),
      phoneNumber: callback.Msisdn,
      accountReference: callback.BillRefNumber || '',
      transactionId: callback.TransID,
      status: TransactionStatus.COMPLETED,
      description: `C2B Payment - ${callback.TransType}`,
      rawCallback: callback,
      createdAt: new Date(callback.TransTime),
      updatedAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async initiateB2C(request: B2CRequest): Promise<B2CResponse> {
    const token = await this.getAccessToken();

    const payload = {
      InitiatorName: this.config.initiatorName,
      SecurityCredential: this.config.securityCredential,
      CommandID: 'BusinessPayment',
      Amount: Math.ceil(request.amount),
      PartyA: this.config.shortCode,
      PartyB: this.sanitizePhoneNumber(request.phoneNumber),
      Remarks: request.occasion,
      QueueTimeOutURL: this.config.timeoutUrl,
      ResultURL: request.callbackUrl || this.config.resultUrl,
      Occasion: request.occasion,
    };

    try {
      const response = await this.http.post<B2CResponse>(
        '/mpesa/b2c/v1/paymentrequest',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.logger.log(`B2C initiated: ${response.data.ConversationID}`);

      const transaction: TransactionRecord = {
        id: response.data.ConversationID || `b2c_${Date.now()}`,
        transactionType: TransactionType.B2C,
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        accountReference: request.occasion,
        transactionId: response.data.ConversationID,
        status: TransactionStatus.PENDING,
        description: `B2C Payout - ${request.occasion}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.transactions.set(transaction.id, transaction);

      return response.data;
    } catch (error: any) {
      this.logger.error('B2C failed', error.response?.data || error.message);
      throw new Error(`B2C payment failed: ${error.message}`);
    }
  }

  handleB2CCallback(callback: B2CCallback): TransactionRecord | null {
    this.logger.log('Processing B2C Callback', callback);

    const existingTransaction = Array.from(this.transactions.values()).find(
      t => t.transactionId === callback.ConversationID
    );

    if (!existingTransaction) {
      this.logger.warn(`B2C Transaction not found: ${callback.ConversationID}`);
      return null;
    }

    const isSuccess = callback.ResponseCode === '0';
    existingTransaction.status = isSuccess ? TransactionStatus.COMPLETED : TransactionStatus.FAILED;
    existingTransaction.description = callback.ResponseDescription;
    existingTransaction.transactionId = callback.TransactionID;
    existingTransaction.updatedAt = new Date();

    if (isSuccess) {
      existingTransaction.amount = callback.TransactionAmount || existingTransaction.amount;
    }

    this.transactions.set(existingTransaction.id, existingTransaction);

    return existingTransaction;
  }

  async reverseTransaction(
    transactionId: string,
    amount: number,
    receiverPhone: string,
    remarks: string
  ): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      InitiatorName: this.config.initiatorName,
      SecurityCredential: this.config.securityCredential,
      CommandID: 'TransactionReversal',
      TransactionID: transactionId,
      Amount: Math.ceil(amount),
      ReceiverParty: this.config.shortCode,
      RecieverIdentifier: this.config.shortCode,
      Remarks: remarks,
      QueueTimeOutURL: this.config.timeoutUrl,
      ResultURL: this.config.resultUrl,
    };

    try {
      const response = await this.http.post(
        '/mpesa/reversal/v1/request',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.logger.log(`Reversal initiated for ${transactionId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Reversal failed', error.response?.data || error.message);
      throw new Error(`Transaction reversal failed: ${error.message}`);
    }
  }

  async getBalance(): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      CommandID: 'GetAccountBalance',
      PartyA: this.config.shortCode,
      IdentifierType: '4',
      Remarks: 'Checking account balance',
      QueueTimeOutURL: this.config.timeoutUrl,
      ResultURL: this.config.resultUrl,
    };

    try {
      const response = await this.http.post(
        '/mpesa/accountbalance/v1/query',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Balance query failed', error.response?.data || error.message);
      throw new Error(`Balance query failed: ${error.message}`);
    }
  }

  getTransaction(transactionId: string): TransactionRecord | undefined {
    return this.transactions.get(transactionId);
  }

  getAllTransactions(): TransactionRecord[] {
    return Array.from(this.transactions.values());
  }

  private sanitizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      cleaned = '254' + cleaned.substring(3);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }
}
