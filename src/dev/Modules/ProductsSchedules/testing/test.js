const ProductsSchedules = require('../index');

// ProductsSchedules.ReturnMOSSchedule();
// ProductsSchedules.ReplaceMOSScheduleData();
ProductsSchedules.ReplaceMOSScheduleData({
	groupProductsByTime: 'true',
	onlyDate: '2020-08-07',
	summarizeVenues: 'Special Exhibits,Drop-In Activities,Butterfly Garden',
});
