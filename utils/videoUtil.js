// 上传视频的公共方法
function uploadVideo() {
  var me = this;

  wx.chooseVideo({
    sourceType: ['album'],
    success: function (res) {
      console.log(res);

    // 从视频对象中获取需要的元素
      var duration = res.duration;
      var tmpHeight = res.height;
      var tmpWidth = res.width;
      var tmpVideoUrl = res.tempFilePath;
      var tmpCoverUrl = res.thumbTempFilePath;

    // 允许15.x秒  
      if (duration > 16) {
        wx.showToast({
          title: '视频长度不能超过15秒...',
          icon: "none",
          duration: 2500
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '视频长度太短，请上传超过1秒的视频...',
          icon: "none",
          duration: 2500
        })
      } else {
        // 选择视频后跳转到选择bgm的页面
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration
            + "&tmpHeight=" + tmpHeight
            + "&tmpWidth=" + tmpWidth
            + "&tmpVideoUrl=" + tmpVideoUrl
            + "&tmpCoverUrl=" + tmpCoverUrl
          ,
        })
      }
    }
  })
}

// 对外开放函数
module.exports = {
  uploadVideo: uploadVideo
}
