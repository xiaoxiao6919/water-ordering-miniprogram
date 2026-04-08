// app.js
App({
  onLaunch() {
    // 检查订单日期，如果是新的一天，清空今日订单
    this.checkAndResetDailyOrders();
  },
  
  checkAndResetDailyOrders() {
    const today = this.getToday();
    const lastDate = wx.getStorageSync('lastOrderDate');
    
    if (lastDate && lastDate !== today) {
      // 将今日订单移到历史记录
      const todayOrders = wx.getStorageSync('orders') || [];
      if (todayOrders.length > 0) {
        const historyData = wx.getStorageSync('orderHistory') || {};
        if (!historyData[lastDate]) {
          historyData[lastDate] = [];
        }
        historyData[lastDate] = historyData[lastDate].concat(todayOrders);
        wx.setStorageSync('orderHistory', historyData);
      }
      
      // 清空今日订单
      wx.setStorageSync('orders', []);
      wx.setStorageSync('lastOrderDate', today);
    } else if (!lastDate) {
      wx.setStorageSync('lastOrderDate', today);
    }
  },
  
  getToday() {
    const date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
  }
})
