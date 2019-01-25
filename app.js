App({
  // 服务器url
  serverUrl: "http://192.168.1.103:8081",

  // 用户对象设置到本地缓存中
  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user);
  },

  // 从本地缓存中获取
  getGlobalUserInfo: function() {
    return wx.getStorageSync("userInfo");
  },

  // 举报选项
  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ]
})