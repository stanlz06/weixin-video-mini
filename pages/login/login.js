const app = getApp()

Page({
  onLoad: function(params) {
  },

  // 登录方法  
  doLogin: function(e) {
    var me = this;
    // event.detail = {value : {'name': 'value'} , formId: ''}
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    
    // 简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      var serverUrl = app.serverUrl;

      wx.showLoading({
        title: '请等待...',
      });

      // 调用后端
      wx.request({
        url: serverUrl + '/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          console.log(res.data);
          wx.hideLoading();

          // 登录成功跳转 
          if (res.data.status == 200) {
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });
            
            // 设置保存到全局用户变量
            app.setGlobalUserInfo(res.data.data);

            // 登录成功跳转个人信息页面
            wx.redirectTo({
              url: '../mine/mine',
            })
          }      
           // 失败弹出框
           else if (res.data.status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },

  // 返回注册页面
  goRegistPage: function() {
    wx.redirectTo({
      url: '../regist/regist',
    })
  }
})