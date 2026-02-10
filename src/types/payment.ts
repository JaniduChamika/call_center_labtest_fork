// Payment Types for PayHere Integration

export interface PaymentRequest {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  psp: string;
  metadata: {
    doctorName?: string;
    appointmentDate?: string;
    sessionNumber?: number;
    patientName?: string;
  };
}

export interface PayHereFormData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
  sandbox: string;
}

export interface PaymentResponse {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  psp: string;
  payhereForm: PayHereFormData;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookPayload {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  method?: string;
  status_message?: string;
  card_holder_name?: string;
  card_no?: string;
  payment_id?: string;
}
