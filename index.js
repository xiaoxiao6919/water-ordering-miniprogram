Page({
  data: {
    name: '',
    phone: '',
    college: '',
    productType: '桶装水',
    count: 1,
    paymentType: '现结',
    deliveryTime: '',
    deliveryAddress: '',
    remark: '',
    success: false
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onPhoneInput(e) {
    let value = e.detail.value;
    // 确保只能输入数字
    value = value.replace(/\D/g, '');
    // 限制最多11位
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    this.setData({ phone: value });
  },

  onCollegeInput(e) {
    this.setData({ college: e.detail.value });
  },

  onProductTypeChange(e) {
    this.setData({ productType: e.currentTarget.dataset.type });
  },

  onDeliveryTimeInput(e) {
    this.setData({ deliveryTime: e.detail.value });
  },

  onDeliveryAddressInput(e) {
    this.setData({ deliveryAddress: e.detail.value });
  },

  onIncrease() {
    this.setData({ count: this.data.count + 1 });
  },

  onDecrease() {
    if (this.data.count > 1) {
      this.setData({ count: this.data.count - 1 });
    }
  },

  onPaymentTypeChange(e) {
    this.setData({ paymentType: e.currentTarget.dataset.type });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  onSubmit() {
    const { name, phone, college, productType, count, paymentType, deliveryTime, deliveryAddress, remark } = this.data;

    // 表单验证
    if (!name.trim()) {
      wx.showToast({ title: '请输入老师姓名', icon: 'none' });
      return;
    }

    if (!phone.trim()) {
      wx.showToast({ title: '请输入手机号码', icon: 'none' });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      wx.showToast({ title: '请输入正确的手机号码', icon: 'none' });
      return;
    }

    if (!college.trim()) {
      wx.showToast({ title: '请输入学院名称', icon: 'none' });
      return;
    }

    if (count < 1) {
      wx.showToast({ title: '订购数量至少为1', icon: 'none' });
      return;
    }

    if (!deliveryTime.trim()) {
      wx.showToast({ title: '请输入配送时间', icon: 'none' });
      return;
    }

    if (!deliveryAddress.trim()) {
      wx.showToast({ title: '请输入配送地址', icon: 'none' });
      return;
    }

    // 创建订单
    const order = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      college: college.trim(),
      productType: productType,
      count: count,
      paymentType: paymentType,
      deliveryTime: deliveryTime.trim(),
      deliveryAddress: deliveryAddress.trim(),
      remark: remark.trim(),
      status: '待配送',
      createTime: this.formatTime(new Date()),
      updateTime: this.formatTime(new Date())
    };

    // 保存到本地存储
    const orders = wx.getStorageSync('orders') || [];
    orders.unshift(order);
    wx.setStorageSync('orders', orders);

    // 显示成功提示
    this.setData({ success: true });

    setTimeout(() => {
      this.setData({ success: false });
      // 重置表单
      this.setData({
        name: '',
        phone: '',
        college: '',
        productType: '桶装水',
        count: 1,
        paymentType: '现结',
        deliveryTime: '',
        deliveryAddress: '',
        remark: ''
      });
      wx.showToast({ title: '下单成功', icon: 'success' });
    }, 2000);
  },

  formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
})
