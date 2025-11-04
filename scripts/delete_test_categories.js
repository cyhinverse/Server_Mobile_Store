import mongoose from 'mongoose';
import Category from '../src/modules/category/category.model.js';

const MONGODB_URI =
	'mongodb+srv://cyhin2508:Laotian2004@yibu.lno79.mongodb.net/db_mobile_stores?retryWrites=true&w=majority';

/**
 * Script để xóa các category có tên bắt đầu bằng "Test"
 */
async function deleteTestCategories() {
	try {
		// Kết nối MongoDB
		await mongoose.connect(MONGODB_URI);
		console.log('✅ Connected to MongoDB Atlas');

		// Tìm tất cả categories có tên chứa "Test Category"
		const testCategories = await Category.find({
			name: { $regex: /Test Category/i }, // Tìm tên chứa "Test Category"
		});

		if (testCategories.length === 0) {
			console.log('✅ No test categories found. Database is clean!');
			await mongoose.connection.close();
			process.exit(0);
		}

		console.log(`\n📋 Found ${testCategories.length} test categories:`);
		testCategories.forEach((cat, index) => {
			console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
		});

		// Xóa các test categories
		const result = await Category.deleteMany({
			name: { $regex: /Test Category/i },
		});

		console.log(`\n🗑️  Deleted ${result.deletedCount} test categories`);

		// Hiển thị số lượng còn lại
		const remainingCount = await Category.countDocuments();
		console.log(`📊 Remaining categories: ${remainingCount}`);

		console.log('\n✅ Cleanup complete!');

		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error('❌ Error:', error);
		await mongoose.connection.close();
		process.exit(1);
	}
}

// Chạy script
deleteTestCategories();
