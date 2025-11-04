/**
 * Script để seed categories vào database
 * Chạy: node scripts/seed_categories.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Category Schema
const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		description: {
			type: String,
			trim: true,
		},
		image: {
			type: String,
			default: null,
		},
		parentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

const Category = mongoose.model('Category', categorySchema);

// Dữ liệu categories cần seed
const categoriesData = [
	// === ĐIỆN THOẠI & TABLET ===
	{
		name: 'Điện thoại & Tablet',
		slug: 'dien-thoai-tablet',
		description:
			'Điện thoại thông minh, máy tính bảng các thương hiệu hàng đầu',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max_3.png',
		parentId: null,
	},
	{
		name: 'Điện thoại',
		slug: 'dien-thoai',
		description: 'Điện thoại thông minh chính hãng, đầy đủ phụ kiện',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max_3.png',
		parentId: null, // Sẽ được cập nhật sau
		parentSlug: 'dien-thoai-tablet',
	},
	{
		name: 'iPhone',
		slug: 'iphone',
		description: 'iPhone Apple chính hãng VN/A, bảo hành 12 tháng',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max_3.png',
		parentId: null,
		parentSlug: 'dien-thoai',
	},
	{
		name: 'Samsung',
		slug: 'samsung',
		description: 'Samsung Galaxy chính hãng, công nghệ tiên tiến',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra_1.png',
		parentId: null,
		parentSlug: 'dien-thoai',
	},
	{
		name: 'Xiaomi',
		slug: 'xiaomi',
		description: 'Xiaomi, Redmi giá tốt nhất thị trường',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14t-pro_1.png',
		parentId: null,
		parentSlug: 'dien-thoai',
	},
	{
		name: 'OPPO',
		slug: 'oppo',
		description: 'OPPO Find, Reno series với camera xuất sắc',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/p/oppo-reno-12-pro.png',
		parentId: null,
		parentSlug: 'dien-thoai',
	},
	{
		name: 'Vivo',
		slug: 'vivo',
		description: 'Vivo V series, Y series giá rẻ',
		parentId: null,
		parentSlug: 'dien-thoai',
	},
	{
		name: 'Realme',
		slug: 'realme',
		description: 'Realme dành cho giới trẻ, hiệu năng cao',
		parentId: null,
		parentSlug: 'dien-thoai',
	},
	{
		name: 'Tablet',
		slug: 'tablet',
		description: 'Máy tính bảng iPad, Samsung, Xiaomi',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-m4-11-inch_1.png',
		parentId: null,
		parentSlug: 'dien-thoai-tablet',
	},
	{
		name: 'iPad',
		slug: 'ipad',
		description: 'iPad Pro, Air, Mini chính hãng Apple',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-m4-11-inch_1.png',
		parentId: null,
		parentSlug: 'tablet',
	},
	{
		name: 'Samsung Tablet',
		slug: 'samsung-tablet',
		description: 'Samsung Galaxy Tab S series cao cấp',
		parentId: null,
		parentSlug: 'tablet',
	},

	// === LAPTOP ===
	{
		name: 'Laptop',
		slug: 'laptop',
		description: 'Laptop văn phòng, gaming, đồ họa cao cấp',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-13-inch_1.png',
		parentId: null,
	},
	{
		name: 'Laptop Gaming',
		slug: 'laptop-gaming',
		description: 'Laptop gaming hiệu năng cao, card đồ họa mạnh',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/s/asus-rog-strix-g16.png',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'Laptop Văn Phòng',
		slug: 'laptop-van-phong',
		description: 'Laptop mỏng nhẹ cho công việc văn phòng',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'MacBook',
		slug: 'macbook',
		description: 'MacBook Air, MacBook Pro chip M series',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-13-inch_1.png',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'Dell',
		slug: 'dell',
		description: 'Dell XPS, Inspiron, Alienware',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'HP',
		slug: 'hp',
		description: 'HP Pavilion, Envy, Omen gaming',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'Asus',
		slug: 'asus',
		description: 'Asus ROG, TUF, Vivobook',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'Lenovo',
		slug: 'lenovo',
		description: 'Lenovo ThinkPad, IdeaPad, Legion',
		parentId: null,
		parentSlug: 'laptop',
	},
	{
		name: 'MSI',
		slug: 'msi',
		description: 'MSI Gaming laptop, workstation',
		parentId: null,
		parentSlug: 'laptop',
	},

	// === PHỤ KIỆN ===
	{
		name: 'Phụ kiện',
		slug: 'phu-kien',
		description: 'Phụ kiện điện thoại, laptop đa dạng',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/i/airpods-pro-2-usb-c_1.png',
		parentId: null,
	},
	{
		name: 'Tai nghe',
		slug: 'tai-nghe',
		description: 'Tai nghe Bluetooth, có dây, gaming',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/i/airpods-pro-2-usb-c_1.png',
		parentId: null,
		parentSlug: 'phu-kien',
	},
	{
		name: 'Tai nghe Bluetooth',
		slug: 'tai-nghe-bluetooth',
		description: 'Tai nghe không dây True Wireless',
		parentId: null,
		parentSlug: 'tai-nghe',
	},
	{
		name: 'AirPods',
		slug: 'airpods',
		description: 'AirPods Pro, AirPods Max chính hãng',
		parentId: null,
		parentSlug: 'tai-nghe-bluetooth',
	},
	{
		name: 'Sạc dự phòng',
		slug: 'sac-du-phong',
		description: 'Pin sạc dự phòng các dung lượng',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/n/anker-powercore-10000.png',
		parentId: null,
		parentSlug: 'phu-kien',
	},
	{
		name: 'Cáp sạc',
		slug: 'cap-sac',
		description: 'Cáp Lightning, USB-C, Micro USB',
		parentId: null,
		parentSlug: 'phu-kien',
	},
	{
		name: 'Adapter sạc',
		slug: 'adapter-sac',
		description: 'Củ sạc nhanh, sạc không dây',
		parentId: null,
		parentSlug: 'phu-kien',
	},
	{
		name: 'Ốp lưng',
		slug: 'op-lung',
		description: 'Ốp lưng, bao da điện thoại',
		parentId: null,
		parentSlug: 'phu-kien',
	},
	{
		name: 'Dán màn hình',
		slug: 'dan-man-hinh',
		description: 'Kính cường lực, dán PPF',
		parentId: null,
		parentSlug: 'phu-kien',
	},
	{
		name: 'Chuột & Bàn phím',
		slug: 'chuot-ban-phim',
		description: 'Chuột, bàn phím không dây, gaming',
		parentId: null,
		parentSlug: 'phu-kien',
	},

	// === THIẾT BỊ THÔNG MINH ===
	{
		name: 'Thiết bị thông minh',
		slug: 'thiet-bi-thong-minh',
		description: 'Đồng hồ thông minh, thiết bị smarthome',
		parentId: null,
	},
	{
		name: 'Đồng hồ thông minh',
		slug: 'dong-ho-thong-minh',
		description: 'Apple Watch, Samsung Galaxy Watch',
		image:
			'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/a/p/apple-watch-series-10_1.png',
		parentId: null,
		parentSlug: 'thiet-bi-thong-minh',
	},
	{
		name: 'Apple Watch',
		slug: 'apple-watch',
		description: 'Apple Watch Series mới nhất',
		parentId: null,
		parentSlug: 'dong-ho-thong-minh',
	},
	{
		name: 'Vòng đeo tay',
		slug: 'vong-deo-tay',
		description: 'Vòng đeo tay theo dõi sức khỏe',
		parentId: null,
		parentSlug: 'thiet-bi-thong-minh',
	},
	{
		name: 'Camera an ninh',
		slug: 'camera-an-ninh',
		description: 'Camera giám sát, camera hành trình',
		parentId: null,
		parentSlug: 'thiet-bi-thong-minh',
	},

	// === THU CŨ ĐỔI MỚI ===
	{
		name: 'Thu cũ đổi mới',
		slug: 'thu-cu-doi-moi',
		description: 'Thu cũ đổi mới, trợ giá cao',
		parentId: null,
	},
	{
		name: 'Thu cũ iPhone',
		slug: 'thu-cu-iphone',
		description: 'Thu cũ iPhone giá cao nhất thị trường',
		parentId: null,
		parentSlug: 'thu-cu-doi-moi',
	},
	{
		name: 'Thu cũ Samsung',
		slug: 'thu-cu-samsung',
		description: 'Thu cũ Samsung đổi máy mới',
		parentId: null,
		parentSlug: 'thu-cu-doi-moi',
	},
	{
		name: 'Thu cũ Laptop',
		slug: 'thu-cu-laptop',
		description: 'Thu cũ laptop, MacBook đổi mới',
		parentId: null,
		parentSlug: 'thu-cu-doi-moi',
	},

	// === HÀNG CŨ ===
	{
		name: 'Hàng cũ',
		slug: 'hang-cu',
		description: 'Điện thoại, laptop cũ giá rẻ',
		parentId: null,
	},
	{
		name: 'iPhone cũ',
		slug: 'iphone-cu',
		description: 'iPhone cũ 99% giá tốt',
		parentId: null,
		parentSlug: 'hang-cu',
	},
	{
		name: 'Samsung cũ',
		slug: 'samsung-cu',
		description: 'Samsung cũ đẹp như mới',
		parentId: null,
		parentSlug: 'hang-cu',
	},
	{
		name: 'Laptop cũ',
		slug: 'laptop-cu',
		description: 'Laptop cũ giá sinh viên',
		parentId: null,
		parentSlug: 'hang-cu',
	},

	// === KHUYẾN MÃI ===
	{
		name: 'Khuyến mãi',
		slug: 'khuyen-mai',
		description: 'Sản phẩm khuyến mãi giá sốc',
		parentId: null,
	},
	{
		name: 'Giảm giá sốc',
		slug: 'giam-gia-soc',
		description: 'Giảm giá mạnh cuối tuần',
		parentId: null,
		parentSlug: 'khuyen-mai',
	},
	{
		name: 'Săn sale',
		slug: 'san-sale',
		description: 'Flash sale mỗi ngày',
		parentId: null,
		parentSlug: 'khuyen-mai',
	},
];

// Hàm connect database
async function connectDB() {
	try {
		const dbUri =
			process.env.MONGO_URI ||
			process.env.MONGODB_URI ||
			'mongodb://localhost:27017/mobile_store';

		console.log('🔗 Connecting to MongoDB...');
		await mongoose.connect(dbUri);
		console.log('✅ Connected to MongoDB Atlas');
	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		process.exit(1);
	}
}

// Hàm seed categories
async function seedCategories() {
	try {
		console.log('🌱 Starting seed categories...\n');

		// Xóa tất cả categories cũ (optional - comment out nếu không muốn xóa)
		// await Category.deleteMany({});
		// console.log("🗑️  Cleared old categories\n");

		// Map để lưu ObjectId theo slug
		const categoryMap = new Map();

		// Phase 1: Tạo tất cả categories cha (parentSlug = null)
		console.log('📦 Phase 1: Creating parent categories...');
		const parentCategories = categoriesData.filter(
			(cat) => !cat.parentSlug || cat.parentSlug === null
		);

		for (const catData of parentCategories) {
			const existingCat = await Category.findOne({ slug: catData.slug });

			if (existingCat) {
				console.log(`   ⏭️  Skipped: ${catData.name} (already exists)`);
				categoryMap.set(catData.slug, existingCat._id);
			} else {
				const newCat = await Category.create({
					name: catData.name,
					slug: catData.slug,
					description: catData.description,
					image: catData.image,
					parentId: null,
					isActive: true,
				});
				categoryMap.set(catData.slug, newCat._id);
				console.log(`   ✅ Created: ${catData.name}`);
			}
		}

		// Phase 2: Tạo categories con và cập nhật parentId
		console.log('\n📦 Phase 2: Creating child categories...');
		const childCategories = categoriesData.filter(
			(cat) => cat.parentSlug && cat.parentSlug !== null
		);

		for (const catData of childCategories) {
			const existingCat = await Category.findOne({ slug: catData.slug });

			if (existingCat) {
				console.log(`   ⏭️  Skipped: ${catData.name} (already exists)`);
				categoryMap.set(catData.slug, existingCat._id);
			} else {
				const parentId = categoryMap.get(catData.parentSlug);

				if (!parentId) {
					console.log(
						`   ⚠️  Warning: Parent not found for ${catData.name} (${catData.parentSlug})`
					);
					continue;
				}

				const newCat = await Category.create({
					name: catData.name,
					slug: catData.slug,
					description: catData.description,
					image: catData.image,
					parentId: parentId,
					isActive: true,
				});
				categoryMap.set(catData.slug, newCat._id);
				console.log(
					`   ✅ Created: ${catData.name} (child of ${catData.parentSlug})`
				);
			}
		}

		// Hiển thị kết quả
		const totalCategories = await Category.countDocuments();
		console.log('\n' + '='.repeat(50));
		console.log('✨ Seed completed successfully!');
		console.log(`📊 Total categories in database: ${totalCategories}`);
		console.log('='.repeat(50));

		// Hiển thị cấu trúc cây
		console.log('\n🌳 Category Tree Structure:\n');
		await displayTreeStructure();
	} catch (error) {
		console.error('❌ Error seeding categories:', error);
		throw error;
	}
}

// Hàm hiển thị cấu trúc cây
async function displayTreeStructure() {
	const rootCategories = await Category.find({ parentId: null }).sort({
		name: 1,
	});

	for (const root of rootCategories) {
		console.log(`📁 ${root.name} (${root.slug})`);
		await displayChildren(root._id, 1);
	}
}

async function displayChildren(parentId, level) {
	const children = await Category.find({ parentId }).sort({ name: 1 });

	for (const child of children) {
		const indent = '  '.repeat(level);
		console.log(`${indent}├─ ${child.name} (${child.slug})`);
		await displayChildren(child._id, level + 1);
	}
}

// Main function
async function main() {
	try {
		await connectDB();
		await seedCategories();
		console.log('\n✅ All done! You can now check your database.');
	} catch (error) {
		console.error('\n❌ Fatal error:', error);
	} finally {
		await mongoose.connection.close();
		console.log('\n👋 Database connection closed');
		process.exit(0);
	}
}

// Run script
main();
