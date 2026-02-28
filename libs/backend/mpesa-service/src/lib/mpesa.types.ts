export enum MpesaEnvironment {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
}

export enum TransactionType {
  STK_PUSH = 'CustomerPayBillOnline',
  STK_PUSH_TO = 'CustomerBuyGoodsOnline',
  C2B = 'PayBill',
  B2C = 'BusinessPayment',
  REVERSAL = 'TransactionReversal',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface MpesaConfig {
  environment: MpesaEnvironment;
  shortCode: string;
  initiatorName: string;
  securityCredential: string;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  callbackUrl: string;
  timeoutUrl: string;
  resultUrl: string;
}

export interface StkPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
}

export interface C2BRegisterRequest {
  shortCode: string;
  responseType: 'Completed' | 'Cancelled';
  confirmationURL: string;
  validationURL: string;
}

export interface C2BRegisterResponse {
  ConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface B2CRequest {
  phoneNumber: string;
  amount: number;
  occasion: string;
  callbackUrl?: string;
}

export interface B2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface B2CCallback {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
  TransactionID?: string;
  TransactionReceipt?: string;
  TransactionCompletedDateTime?: string;
  ReceiverPartyPublicName?: string;
  TransactionAmount?: number;
  WorkingAccountAvailableFunds?: number;
  WorkingAccountUtilized?: number;
  QueueTimeOutURL?: string;
  ResultURL?: string;
}

export interface TransactionRecord {
  id: string;
  transactionType: TransactionType;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionId?: string;
  status: TransactionStatus;
  description: string;
  rawCallback?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MpesaApiResponse {
  ResponseCode: string;
  ResponseDescription: string;
  [key: string]: any;
}
