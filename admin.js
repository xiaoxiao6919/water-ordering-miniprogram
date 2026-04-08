Page({
  data: {
    orders: [],
    filteredOrders: [],
    filterStatus: '全部',
    todayTotalOrders: 0,
    todayPendingOrders: 0,
    todayCompletedOrders: 0,
    todayTotalWater: 0,
    todayDate: '',
    selectedDate: '',
    historyOrders: [],
    historyTotalOrders: 0,
    historyTotalWater: 0,
    lastOrderCount: 0
  },

  onLoad() {
    this.loadData();
    this.startOrderCheck();
  },

  onShow() {
    this.loadData();
  },

  onUnload() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  },

  loadData() {
    const today = this.getToday();
    this.setData({ todayDate: today });

    // 获取今日订单
    const orders = wx.getStorageSync('orders') || [];
    this.setData({ 
      orders: orders,
      filteredOrders: this.filterOrders(orders, '全部')
    });

    // 计算今日统计
    this.calculateTodayStats(orders);
  },

  getToday() {
    const date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  },

  calculateTodayStats(orders) {
    const todayOrders = orders;
    const totalOrders = todayOrders.length;
    const pendingOrders = todayOrders.filter(o => o.status === '待配送').length;
    const completedOrders = todayOrders.filter(o => o.status === '已完成').length;
    const totalWater = todayOrders.reduce((sum, order) => sum + order.count, 0);

    this.setData({
      todayTotalOrders: totalOrders,
      todayPendingOrders: pendingOrders,
      todayCompletedOrders: completedOrders,
      todayTotalWater: totalWater
    });

    // 检查新订单
    this.checkNewOrders(totalOrders);
  },

  checkNewOrders(currentCount) {
    if (this.data.lastOrderCount > 0 && currentCount > this.data.lastOrderCount) {
      const newCount = currentCount - this.data.lastOrderCount;
      this.showNotification(`有 ${newCount} 个新订单待处理！`);
    }
    this.setData({ lastOrderCount: currentCount });
  },

  showNotification(message) {
    // 页面内提示
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });

    // 标题栏通知
    wx.setNavigationBarTitle({
      title: `新订单 - ${message}`
    });

    // 恢复标题栏
    setTimeout(() => {
      wx.setNavigationBarTitle({
        title: '订单管理'
      });
    }, 5000);

    // 订阅消息（需要先配置模板ID）
    try {
      wx.requestSubscribeMessage({
        tmplIds: [],
        success(res) {
          console.log('订阅消息授权结果：', res);
        },
        fail(err) {
          console.log('订阅消息请求失败：', err);
        }
      });
    } catch (e) {
      console.log('订阅消息功能暂时不可用');
    }
  },

  startOrderCheck() {
    // 每30秒检查一次新订单
    this.checkTimer = setInterval(() => {
      const orders = wx.getStorageSync('orders') || [];
      this.calculateTodayStats(orders);
    }, 30000);
  },

  onFilterChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 
      filterStatus: status,
      filteredOrders: this.filterOrders(this.data.orders, status)
    });
  },

  filterOrders(orders, status) {
    if (status === '全部') {
      return orders;
    }
    return orders.filter(order => order.status === status);
  },

  onDateChange(e) {
    const selectedDate = e.detail.value;
    this.setData({ selectedDate });

    if (selectedDate) {
      const historyData = wx.getStorageSync('orderHistory') || {};
      const historyOrders = historyData[selectedDate] || [];
      
      this.setData({
        historyOrders: historyOrders,
        historyTotalOrders: historyOrders.length,
        historyTotalWater: historyOrders.reduce((sum, order) => sum + order.count, 0)
      });
    }
  },

  onDeliver(e) {
    const id = e.currentTarget.dataset.id;
    const orders = this.data.orders.map(order => {
      if (order.id === id) {
        return {
          ...order,
          status: '已完成',
          updateTime: this.formatTime(new Date())
        };
      }
      return order;
    });

    this.setData({ 
      orders: orders,
      filteredOrders: this.filterOrders(orders, this.data.filterStatus)
    });

    wx.setStorageSync('orders', orders);
    this.calculateTodayStats(orders);
    wx.showToast({ title: '已标记为配送完成', icon: 'success' });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          const orders = this.data.orders.filter(order => order.id !== id);
          this.setData({ 
            orders: orders,
            filteredOrders: this.filterOrders(orders, this.data.filterStatus)
          });

          wx.setStorageSync('orders', orders);
          this.calculateTodayStats(orders);
          wx.showToast({ title: '订单已删除', icon: 'success' });
        }
      }
    });
  },

  onCallPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  onShareAppMessage() {
    return {
      title: '订单管理',
      path: '/pages/admin/admin',
      imageUrl: ''
    };
  }
})
