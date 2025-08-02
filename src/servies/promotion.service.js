const prisma = require('../config/prisma');
const { values } = require('../middleware/auth.middleware');

exports.createNewPromotion = async (promotionData) => {
    
    try {

        //step 1 find product id from name
        // find product id
        const product = await prisma.products.findFirst({
            where: {
                OR: [
                { name: promotionData.product },
                { barcode: promotionData.barcode }
            ]
            },
            select: {
                id: true
            }
        });
        
        if (!product || product.length === 0) {
            return { success: false, status: 400, message: "can't find product name, pls make sure you enter product correctly"}
        }

        const isHavePromotion = await prisma.productPromotions.findFirst({
            where: {
                productId: product.id
            }
        })

        if(isHavePromotion) {
            return { success: false, status: 400, message: "this product is already have promotion"};
        }
        //step 2 create promotion
        //input enum validate
        const inputDiscountType = ['PERCENT', 'FIXED']
        if(!inputDiscountType.includes(promotionData.discountType)) {
            return { success: false, status: 400, message: "discount type doesn't have"}
        }

        //discount valid
        if(promotionData.discountType === 'PERCENT') {
            if (promotionData.discountValue >= 100) {
                return { success: false, status: 400, message: "discount percent type can't more than 100"}
            }
        }

        // JavaScript's new Date() constructor handles ISO 8601 strings (like "2025-07-29T00:00:00+07:00")
        // by converting them into a Date object representing the corresponding UTC time.
        //status valid
        const UTC = new Date();
        const start = new Date(promotionData.startDate)
        const end = new Date(promotionData.endDate)
        let status = ''
        if(UTC >= start && UTC <= end) {
            status = 'ACTIVE'
        } else if ( UTC < start){
            status = 'UPCOMING'
        } else {
            status = 'EXPIRED'
        }

        //create promotion
        const newPromotion = await prisma.promotions.create({
            data: {
                name: promotionData.name || null,
                startDate: new Date(promotionData.startDate), // แปลงเป็น Date object
                endDate: new Date(promotionData.endDate),     // แปลงเป็น Date object
                // status จะใช้ค่า default "upcoming" หรือคุณจะส่งมาเองก็ได้
                status,
                discountType: promotionData.discountType,
                discountValue: promotionData.discountValue,
                remainingQuota: promotionData.remainingQuota || null
            },
        });

        //step 3 join product and promotion in prodcutPromotion table
        const joinData = await prisma.productPromotions.create({
            data: {
                productId: product.id,
                promotionId: newPromotion.id
            }
        })
        return { success: true, promotion: newPromotion}
    } catch (error) {
        console.error('Error creating promotion:', error);
        throw error;
    }

}

exports.getPromotions = async() => {
    try {
        const result = await prisma.promotions.findMany({})

        return result
    } catch(err) {
        console.error('Faild from promotion service ERROR:', err)
        throw err;
    }
}