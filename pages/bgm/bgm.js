const app = getApp()

Page({
  data: {
    // bgm列表
    bgmList: [],

    //全局url
    serverUrl: "",

    // onLoad中获取视频参数
    videoParams: {}
  },

  // 通过params获取到选择视频页面转递过来的视频信息
  onLoad: function(params) {
    var me = this;

    // 赋值给videoParams
    me.setData({
      videoParams: params
    });

    wx.showLoading({
      title: '请等待...',
    });

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    // 调用后端获取bgm列表
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        // 判断登录状态
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
          });
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: "none",
            success: function() {
              wx.redirectTo({
                url: '../login/login',
              })
            }
          });
        }
      }
    })
  },

// bgm选择之后上传视频
  upload: function(e) {
    var me = this;

    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;

    var duration = me.data.videoParams.duration;
    var tmpHeight = me.data.videoParams.tmpHeight;
    var tmpWidth = me.data.videoParams.tmpWidth;
    var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
    var tmpCoverUrl = me.data.videoParams.tmpCoverUrl;

    // 上传短视频
    wx.showLoading({
      title: '上传中...',
    })
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();

    // 通过formData传递给后端，不使用？带参数传递
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      formData: {
        userId: userInfo.id, 
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth
      },
      filePath: tmpVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/json', // 默认值
        // 判断登录状态
        'headerUserId': userInfo.id,
        'headerUserToken': userInfo.userToken
      },
      success: function(res) {
        var data = JSON.parse(res.data);
        wx.hideLoading();
        if (data.status == 200) {
          wx.showToast({
            title: '上传成功!~~',
            icon: "success"
          });
          // 上传成功后跳回之前的页面
          wx.navigateBack({
            delta: 1
          })
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: "none"
          });
          wx.redirectTo({
            url: '../login/login',
          })
        } else {
          wx.showToast({
            title: '上传失败!~~',
            icon: "success"
          });
        }
      }
    })
  }
})