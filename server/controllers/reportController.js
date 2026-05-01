import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Export Orders to PDF
export const exportOrdersPDF = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('items.product').populate('user', 'name email').sort({ createdAt: -1 });

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // HTTP headers for downloading
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_report.pdf');

        doc.pipe(res);

        // Report Title
        doc.fontSize(20).text('Greencart Orders Report', { align: 'center' });
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();

        // Table Header
        const tableTop = 150;
        const itemCodeX = 30;
        const customerX = 130;
        const dateX = 250;
        const amountX = 350;
        const statusX = 420;
        const paidX = 500;

        doc.fontSize(10).fillColor('#444444');
        doc.text('Order ID', itemCodeX, tableTop, { bold: true });
        doc.text('Customer', customerX, tableTop, { bold: true });
        doc.text('Date', dateX, tableTop, { bold: true });
        doc.text('Amount', amountX, tableTop, { bold: true });
        doc.text('Status', statusX, tableTop, { bold: true });
        doc.text('Paid', paidX, tableTop, { bold: true });

        const lineSize = 0.5;
        doc.moveTo(30, tableTop + 15).lineTo(560, tableTop + 15).lineWidth(lineSize).stroke();

        let y = tableTop + 25;
        orders.forEach((order) => {
            // Check if page needs to be added
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            doc.fontSize(8).text(order._id.toString().slice(-8).toUpperCase(), itemCodeX, y);
            doc.text(order.user?.name || 'Guest', customerX, y, { width: 110 });
            doc.text(new Date(order.createdAt).toLocaleDateString(), dateX, y);
            doc.text(`${order.amount}`, amountX, y);
            doc.text(order.status, statusX, y);
            doc.text(order.isPaid ? 'YES' : 'NO', paidX, y);

            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export Orders to Excel
export const exportOrdersExcel = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('items.product').populate('user', 'name email').sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'id', width: 20 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Items', key: 'items', width: 40 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Payment', key: 'payment', width: 15 },
            { header: 'Paid', key: 'isPaid', width: 10 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        // Style the header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        orders.forEach(order => {
            const itemsString = order.items.map(i => `${i.product?.name} (x${i.quantity})`).join(', ');
            worksheet.addRow({
                id: order._id.toString(),
                customer: order.user?.name || 'Guest',
                email: order.user?.email || 'N/A',
                date: new Date(order.createdAt).toLocaleDateString(),
                items: itemsString,
                amount: order.amount,
                payment: order.paymentType,
                isPaid: order.isPaid ? 'YES' : 'NO',
                status: order.status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export Products to Excel
export const exportProductsExcel = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Report');

        worksheet.columns = [
            { header: 'Product ID', key: 'id', width: 20 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Price', key: 'price', width: 12 },
            { header: 'Offer Price', key: 'offerPrice', width: 12 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'In Stock', key: 'inStock', width: 10 }
        ];

        worksheet.getRow(1).font = { bold: true };

        products.forEach(p => {
            worksheet.addRow({
                id: p._id.toString(),
                name: p.name,
                category: p.category,
                price: p.price,
                offerPrice: p.offerPrice,
                stock: p.stock,
                inStock: p.inStock ? 'YES' : 'NO'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Export Full Dashboard Report to PDF
export const exportFullReportPDF = async (req, res) => {
    try {
        // Fetch all data
        const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
        const totalOrders = await Order.countDocuments({});
        const totalCustomers = await Order.distinct('userId').then(u => u.length);
        
        const topSelling = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            {
                $addFields: { product_id: { $toObjectId: "$_id" } }
            },
            { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
            { $unwind: "$product" }
        ]);

        const recentTransactions = await Order.find({}).sort({ createdAt: -1 }).limit(50).populate('user', 'name');

        const lowStock = await Product.find({ 
            $or: [{ stock: { $lt: 10 } }, { stock: { $exists: false } }, { inStock: false }] 
        }).limit(20);

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=dashboard_full_report.pdf');
        doc.pipe(res);

        // Header
        doc.fontSize(22).fillColor('#1b5e20').text('Greencart Business Analytics', { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // 1. Executive Summary
        doc.fontSize(16).fillColor('#333').text('1. Executive Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#444');
        doc.text(`Total Revenue: ${totalRevenue[0]?.total || 0}`);
        doc.text(`Total Orders: ${totalOrders}`);
        doc.text(`Total Unique Customers: ${totalCustomers}`);
        doc.moveDown(2);

        // 2. Top Selling Products
        doc.fontSize(16).fillColor('#333').text('2. Top Selling Products', { underline: true });
        doc.moveDown();
        topSelling.forEach((item, index) => {
            doc.fontSize(10).text(`${index + 1}. ${item.product.name} - ${item.totalSold} Units Sold`, { indent: 20 });
        });
        doc.moveDown(2);

        // 3. Recent Transactions
        doc.fontSize(16).fillColor('#333').text('3. Recent Transactions (Last 50)', { underline: true });
        doc.moveDown();
        recentTransactions.forEach((order, index) => {
            doc.fontSize(9).fillColor('#555').text(`${index + 1}. Order #${order._id.toString().slice(-6)} - ${order.user?.name || 'Guest'} - ${order.amount} - ${order.status}`, { indent: 20 });
        });
        doc.moveDown(2);

        // 4. Inventory Alerts
        doc.fontSize(16).fillColor('#333').text('4. Critical Inventory Alerts', { underline: true });
        doc.moveDown();
        lowStock.forEach((item) => {
            const status = item.inStock === false ? 'DISABLED' : (item.stock === 0 ? 'OUT OF STOCK' : `${item.stock} LEFT`);
            doc.fontSize(10).fillColor(item.stock === 0 ? '#d32f2f' : '#ef6c00').text(`• ${item.name}: [${status}]`, { indent: 20 });
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Export Full Dashboard Report to Excel
export const exportFullReportExcel = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        
        // Sheet 1: Summary Stats
        const summarySheet = workbook.addWorksheet('Business Summary');
        const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
        const totalOrders = await Order.countDocuments({});
        
        summarySheet.columns = [{ header: 'Metric', key: 'metric', width: 25 }, { header: 'Value', key: 'value', width: 20 }];
        summarySheet.addRow({ metric: 'Total Revenue', value: totalRevenue[0]?.total || 0 });
        summarySheet.addRow({ metric: 'Total Orders', value: totalOrders });
        summarySheet.getRow(1).font = { bold: true };

        // Sheet 2: Top Selling
        const salesSheet = workbook.addWorksheet('Top Selling Products');
        const topSelling = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            {
                $addFields: { product_id: { $toObjectId: "$_id" } }
            },
            { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
            { $unwind: "$product" }
        ]);
        salesSheet.columns = [{ header: 'Product', key: 'name', width: 30 }, { header: 'Units Sold', key: 'sold', width: 15 }];
        topSelling.forEach(item => salesSheet.addRow({ name: item.product.name, sold: item.totalSold }));
        salesSheet.getRow(1).font = { bold: true };

        // Sheet 3: Transactions
        const transSheet = workbook.addWorksheet('Recent Transactions');
        const transactions = await Order.find({}).sort({ createdAt: -1 }).limit(100).populate('user', 'name');
        transSheet.columns = [
            { header: 'Order ID', key: 'id', width: 25 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date', key: 'date', width: 20 }
        ];
        transactions.forEach(t => transSheet.addRow({
            id: t._id.toString(),
            customer: t.user?.name || 'Guest',
            amount: t.amount,
            status: t.status,
            date: new Date(t.createdAt).toLocaleString()
        }));
        transSheet.getRow(1).font = { bold: true };

        // Sheet 4: Inventory Alerts
        const inventorySheet = workbook.addWorksheet('Inventory Alerts');
        const lowStock = await Product.find({ $or: [{ stock: { $lt: 20 } }, { inStock: false }] });
        inventorySheet.columns = [
            { header: 'Product', key: 'name', width: 30 },
            { header: 'Current Stock', key: 'stock', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];
        lowStock.forEach(item => inventorySheet.addRow({ 
            name: item.name, 
            stock: item.stock || 0, 
            status: item.inStock ? 'Active' : 'Disabled' 
        }));
        inventorySheet.getRow(1).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=full_dashboard_report.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Export Categories to Excel
export const exportCategoriesExcel = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Categories Report');

        worksheet.columns = [
            { header: 'Category ID', key: 'id', width: 20 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Path', key: 'path', width: 25 },
            { header: 'Background Color', key: 'bgColor', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };

        categories.forEach(c => {
            worksheet.addRow({
                id: c._id.toString(),
                name: c.name,
                path: c.path,
                bgColor: c.bgColor
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=categories_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
