var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    // contain：包含，fill：填充，cover：覆盖
    cover: "cover",

    // 视频id
    videoId: "",

    // 视频播放路径
    src: "",

    // 视频信息,onLoad中获取
    videoInfo: {},

    userLikeVideo: false,

    // 评论
    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],

    placeholder: "说点什么..."
  },

  // video上下文对象
  videoCtx: {},

  // params:接收index.showVideoInfo传递的参数
  onLoad: function(params) {
    var me = this; 
    // 供用户操作video组件
    me.videoCtx = wx.createVideoContext("myVideo", me);

    // 获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);
    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;

    var cover = "cover";

    // 横向视频选用默认contain展示
    if (width >= height) {
      cover = "";
    }

    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      // videoInfo供页面调用
      videoInfo: videoInfo,
      cover: cover
    });

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var loginUserId = "";

    // 判断是否为登录状态
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id;
    }
    // 调用后端
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        console.log(res.data);

        // 发布者信息
        var publisher = res.data.data.publisher;
        // 登录用户是否喜欢所点视频
        var userLikeVideo = res.data.data.userLikeVideo;

        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        });
      }
    })

    me.getCommentsList(1);
  },

  // 播放视频
  onShow: function() {
    var me = this;
    me.videoCtx.play();
  },

  // 暂停视频
  onHide: function() {
    var me = this;
    me.videoCtx.pause();
  },

  // 点击搜索按钮,跳转到搜索页面
  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  // 点击头像显示发布者信息
  showPublisher: function() {
    var me = this;

    var user = app.getGlobalUserInfo();

    // 获取视频信息
    var videoInfo = me.data.videoInfo;

    // 重定向url传递到login页面
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    // 判断用户是否登录,未登录则跳转到登录页面
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + realUrl,
      })
    } else {
      // 否则跳转到个人信息页面
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },

  // 上传视频
  upload: function() {
    var me = this;

    var user = app.getGlobalUserInfo();

    // 获取视频信息
    var videoInfo = JSON.stringify(me.data.videoInfo);

    // 重定向url传递到login页面
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    // 判断用户是否登录,未登录则跳转到登录页面
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + realUrl,
      })
    } else {
      // 否则跳转到上传视频页面
      videoUtil.uploadVideo();
    }
  },

  // 回到主页
  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  // 跳转到个人信息页面
  showMine: function() {
    var user = app.getGlobalUserInfo();

    // 判断用户是否登录,未登录则跳转到登录页面
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      // 否则跳转到个人信息页面
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  // 用户点赞
  likeVideoOrNot: function () {
    var me = this;
    // 获取视频信息
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();

    // 判断用户是否登录,未登录则跳转到登录页面
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo;

      // 判断是否点赞
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      if (userLikeVideo) {
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }

      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          // 判断登录状态
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function (res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })
    }
  },
  // 点击分享按钮
  shareMe: function () {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../login/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            // 跳转到举报页面
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '暂未实现...',
          })
        }
      }
    })
  },

  onShareAppMessage: function (res) {

    var me = this;
    var videoInfo = me.data.videoInfo;

    return {
      title: '短视频内容分析',
      path: "pages/videoinfo/videoinfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },


  leaveComment: function () {
    this.setData({
      commentFocus: true
    });
  },

  replyFocus: function (e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  // 保存评论
  saveComment: function (e) {
    var me = this;
    var content = e.detail.value;

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(me.data.videoInfo);

    // 判断用户是否登录,未登录则跳转到登录页面
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    // 判断用户是否登录,未登录则跳转到登录页面
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        // 否则发送请求,保存评论
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          // 判断登录状态
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content
        },
        success: function (res) {
          console.log(res.data)
          wx.hideLoading();

          me.setData({
            contentValue: "",
            commentsList: []
          });

          me.getCommentsList(1);
        }
      })
    }
  },


  // 获取评论列表
  getCommentsList: function (page) {
    var me = this;

    var videoId = me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + "&page=" + page + "&pageSize=5",
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },

  // 上拉刷新
  onReachBottom: function () {
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
  }
})