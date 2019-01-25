const app = getApp()

Page({
  // params:获取videoinfo页面传递的参数
  onLoad: function(params) {
    var me = this;

    var redirectUrl = params.redirectUrl;

    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      // 利用正则把#转为?,@转为=
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");

      me.redirectUrl = redirectUrl;
    }
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

            // 重定向url
            var redirectUrl = me.redirectUrl;

            // 跳转到指定url
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.redirectTo({
                url: redirectUrl,
              })
            } else {
              // 否则跳转到mine页面
              wx.redirectTo({
                url: '../mine/mine',
              })
            }
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