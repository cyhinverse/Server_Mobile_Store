import Payment from './payment.model.js';
import Order from '../order/order.model.js';
import crypto from 'crypto';
import querystring from 'querystring';

class PaymentService {
	constructor() {
		if (PaymentService.instance) return PaymentService.instance;
		this.model = Payment;
		PaymentService.instance = this;
	}

	/**
	 * Tạo URL thanh toán VNPay
	 */
	async createPaymentUrl(orderInfo) {
		try {
			const { orderId, amount, orderDescription, ipAddr } = orderInfo;

			// Kiểm tra order có tồn tại
			const order = await Order.findById(orderId);
			if (!order) {
				throw new Error('Order not found');
			}

			// Tạo payment record
			const payment = await Payment.create({
				user_id: order.user_id,
				amount: amount,
				method: 'vnpay',
				status: 'pending',
			});

			// Cập nhật payment_id cho order
			order.payment_id = payment._id;
			order.payment_method = 'vnpay';
			await order.save();

			// Tạo VNPay params
			const vnpayParams = await this.generateVNPayParams({
				orderId: orderId,
				amount: amount,
				orderDescription: orderDescription || `Thanh toan don hang ${orderId}`,
				ipAddr: ipAddr || '127.0.0.1',
				paymentId: payment._id.toString(),
			});

			return {
				paymentUrl: vnpayParams.paymentUrl,
				paymentId: payment._id,
			};
		} catch (error) {
			throw new Error(`Create payment URL failed: ${error.message}`);
		}
	}

	/**
	 * Xử lý callback từ VNPay
	 */
	async handlePaymentCallback(query) {
		try {
			// Verify signature
			const isValid = await this.verifyVNPaySignature(query);
			if (!isValid) {
				throw new Error('Invalid VNPay signature');
			}

			const {
				vnp_TxnRef,
				vnp_Amount,
				vnp_ResponseCode,
				vnp_TransactionNo,
				vnp_BankCode,
			} = query;

			// Tìm payment theo orderId trong vnp_TxnRef
			const orderId = vnp_TxnRef.split('_')[0];
			const order = await Order.findById(orderId);

			if (!order) {
				throw new Error('Order not found');
			}

			const payment = await Payment.findById(order.payment_id);
			if (!payment) {
				throw new Error('Payment not found');
			}

			// Cập nhật payment status
			if (vnp_ResponseCode === '00') {
				payment.status = 'completed';
				payment.transactionId = vnp_TransactionNo;
				payment.paidAt = new Date();
				payment.responseData = {
					bankCode: vnp_BankCode,
					amount: vnp_Amount / 100,
					responseCode: vnp_ResponseCode,
				};

				// Cập nhật order status
				order.status = 'completed';
			} else {
				payment.status = 'failed';
				payment.responseData = {
					responseCode: vnp_ResponseCode,
					message: this.getVNPayResponseMessage(vnp_ResponseCode),
				};
				order.status = 'cancelled';
			}

			await payment.save();
			await order.save();

			return {
				success: vnp_ResponseCode === '00',
				payment: payment,
				order: order,
				message: this.getVNPayResponseMessage(vnp_ResponseCode),
			};
		} catch (error) {
			throw new Error(`Handle payment callback failed: ${error.message}`);
		}
	}

	/**
	 * Xác thực chữ ký VNPay
	 */
	async verifyVNPaySignature(query) {
		try {
			const vnp_SecureHash = query.vnp_SecureHash;
			delete query.vnp_SecureHash;
			delete query.vnp_SecureHashType;

			// Sắp xếp params theo alphabet
			const sortedParams = this.sortObject(query);
			const signData = querystring.stringify(sortedParams, { encode: false });

			const vnpHashSecret = process.env.VNP_HASH_SECRET;
			const hmac = crypto.createHmac('sha512', vnpHashSecret);
			const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

			return vnp_SecureHash === signed;
		} catch (error) {
			throw new Error(`Verify VNPay signature failed: ${error.message}`);
		}
	}

	/**
	 * Tạo params cho VNPay
	 */
	async generateVNPayParams(order) {
		try {
			const {
				orderId,
				amount,
				orderDescription,
				ipAddr,
				paymentId,
			} = order;

			const vnp_TmnCode = process.env.VNP_TMN_CODE;
			const vnp_HashSecret = process.env.VNP_HASH_SECRET;
			const vnp_Url = process.env.VNP_URL;
			const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

			const date = new Date();
			const createDate = this.formatDate(date);
			const expireDate = this.formatDate(
				new Date(date.getTime() + 15 * 60 * 1000)
			); // 15 phút

			let vnp_Params = {
				vnp_Version: '2.1.0',
				vnp_Command: 'pay',
				vnp_TmnCode: vnp_TmnCode,
				vnp_Locale: 'vn',
				vnp_CurrCode: 'VND',
				vnp_TxnRef: `${orderId}_${paymentId}_${Date.now()}`,
				vnp_OrderInfo: orderDescription,
				vnp_OrderType: 'other',
				vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
				vnp_ReturnUrl: vnp_ReturnUrl,
				vnp_IpAddr: ipAddr,
				vnp_CreateDate: createDate,
				vnp_ExpireDate: expireDate,
			};

			// Sắp xếp params
			vnp_Params = this.sortObject(vnp_Params);

			// Tạo signature
			const signData = querystring.stringify(vnp_Params, { encode: false });
			const hmac = crypto.createHmac('sha512', vnp_HashSecret);
			const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
			vnp_Params.vnp_SecureHash = signed;

			// Tạo payment URL
			const paymentUrl =
				vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

			return {
				paymentUrl,
				params: vnp_Params,
			};
		} catch (error) {
			throw new Error(`Generate VNPay params failed: ${error.message}`);
		}
	}

	/**
	 * Hoàn tiền
	 */
	async refundPayment(orderId) {
		try {
			const order = await Order.findById(orderId);
			if (!order) {
				throw new Error('Order not found');
			}

			const payment = await Payment.findById(order.payment_id);
			if (!payment) {
				throw new Error('Payment not found');
			}

			if (payment.status !== 'completed') {
				throw new Error('Payment is not completed, cannot refund');
			}

			// Cập nhật status
			payment.status = 'failed';
			order.status = 'cancelled';

			await payment.save();
			await order.save();

			return {
				success: true,
				payment: payment,
				order: order,
				message: 'Refund processed successfully',
			};
		} catch (error) {
			throw new Error(`Refund payment failed: ${error.message}`);
		}
	}

	/**
	 * Tạo payment cho COD hoặc Banking
	 */
	async createPayment(paymentData) {
		try {
			const { userId, orderId, amount, method } = paymentData;

			const payment = await Payment.create({
				user_id: userId,
				amount: amount,
				method: method || 'cod',
				status: method === 'cod' ? 'pending' : 'pending',
			});

			// Cập nhật order
			const order = await Order.findById(orderId);
			if (order) {
				order.payment_id = payment._id;
				order.payment_method = method || 'cod';
				await order.save();
			}

			return payment;
		} catch (error) {
			throw new Error(`Create payment failed: ${error.message}`);
		}
	}

	/**
	 * Lấy thông tin payment
	 */
	async getPaymentById(paymentId) {
		try {
			const payment = await Payment.findById(paymentId).populate('user_id');
			return payment;
		} catch (error) {
			throw new Error(`Get payment failed: ${error.message}`);
		}
	}

	/**
	 * Lấy danh sách payments của user
	 */
	async getPaymentsByUserId(userId) {
		try {
			const payments = await Payment.find({ user_id: userId }).sort({
				createdAt: -1,
			});
			return payments;
		} catch (error) {
			throw new Error(`Get payments by user failed: ${error.message}`);
		}
	}

	/**
	 * Cập nhật payment status
	 */
	async updatePaymentStatus(paymentId, status) {
		try {
			const payment = await Payment.findByIdAndUpdate(
				paymentId,
				{
					status: status,
					...(status === 'completed' && { paidAt: new Date() }),
				},
				{ new: true }
			);

			return payment;
		} catch (error) {
			throw new Error(`Update payment status failed: ${error.message}`);
		}
	}

	// Helper methods
	sortObject(obj) {
		const sorted = {};
		const keys = Object.keys(obj).sort();
		keys.forEach((key) => {
			sorted[key] = obj[key];
		});
		return sorted;
	}

	formatDate(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}${month}${day}${hours}${minutes}${seconds}`;
	}

	getVNPayResponseMessage(responseCode) {
		const messages = {
			'00': 'Giao dịch thành công',
			'07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
			'09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
			'10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
			'11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
			'12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
			'13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
			'24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
			'51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
			'65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
			'75': 'Ngân hàng thanh toán đang bảo trì.',
			'79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
			'99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
		};
		return messages[responseCode] || 'Lỗi không xác định';
	}
}

export default new PaymentService();
