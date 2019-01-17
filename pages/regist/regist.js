const app = getApp()

Page({
  // 注册方法
  doRegist: function(e) {
    var me = this;
    // event.detail = {value : {'name': 'value'} , formId: ''}
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    // 判空
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
        url: serverUrl + '/regist',
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
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
                title: "用户注册成功~！！！",
                icon: 'none',
                duration: 3000
              }),
              
            // 保存到全局用户变量
            app.setGlobalUserInfo(res.data.data);

            // 注册成功跳转个人信息页面
            wx.redirectTo({
              url: '../mine/mine',
            })
          } else if (status == 500) {
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

  // 返回登录页面
  goLoginPage: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  }
})