import Payment from './payment.model';

class PaymentService {
	constructor() {
		if (PaymentService.instance) return PaymentService.instance;
		this.model = Payment;
		PaymentService.instance = this;
	}

	async createPaymentUrl(orderInfo) {}
	async handlePaymentCallback(query) {}
	async verifyVNPaySignature(query) {}
	async generateVNPayParams(order) {}
	async refundPayment(orderId) {}
}

export default new PaymentService();
