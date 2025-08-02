const promotionService = require('../../servies/promotion.service')
const cron = require('node-cron');


exports.createPromotion = async (req, res) => {
    const promotionData = req.body;

    //valid data
    if (!promotionData || promotionData.length === 0) {
        return res.status(400).json({ meassage: 'missing promotion data' })
    }

    try {
        const result = await promotionService.createNewPromotion(promotionData);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message })
        }

        res.status(201).json({
            message: 'Create promotion successful!!!',
            promotion: result.promotion
        })
    } catch (err) {
        console.log('ERROR', err)

        res.status(500).json({
            message: 'Failed to create promotion',
            error: err
        })
    }
}

exports.getPromotions = async (req, res) => {
    try {
        const result = await promotionService.getPromotions();

        res.status(200).json({
            promotion: result
        })
    } catch (err) {
        console.error("Falied to get promotiom ERROR:", err)
        res.status(500).json({
            message: 'Failed during promotion'
        })
    }
}

// exports.updatePromotionStatuses = async (req, res) => {
//     try {
//         const result = await promotionService.updatePromotionStatuses();

//         res.status(200).json({
//             message: 'Promotion statuses updated successfully.',
//             details: result,
//         })
//     } catch (err) {
//         console.error('Error during promotion status update ,please try again ERROR:', err)
//         res.status(500).json({
//             message: 'An error occurred during promotion status update.',
//             error: err.message,
//         });
//     }
// }

cron.schedule('0 0 * * *', async () => {
  console.log('Running promotion status update task via cron job...');
  try {
    const result = await promotionService.updatePromotionStatuses();
    console.log('Promotion status update completed.', result);
  } catch (error) {
    console.error('Promotion status update failed:', error);
  }
}, {
  timezone: "Asia/Bangkok" // กำหนด Timezone ให้ตรงกับ GMT+7
});