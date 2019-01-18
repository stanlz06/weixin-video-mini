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

        var publisher = res.data.data.publisher;
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
})