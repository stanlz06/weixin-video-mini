const app = getApp()

Page({
  data: {
    // 总页数
    totalPage: 1,

    // 当前页数
    page:1, 

    // 视频列表
    videoList:[],

    // 屏幕宽度
    screenWidth: 350,

    // 全局的URL
    serverUrl: "",

    // 查询信息
    searchContent: "",
  },

  // params:如果从searchVideo.mySearchFunction跳转则接收传递参数,否则为空
  onLoad: function (params) {
    var me = this;

    // 获取并设置screenWidth
    var screenWidth = wx.getSystemInfoSync().screenWidth;

    me.setData({
      screenWidth: screenWidth,
    });
    
    // 获取查询内容
    var searchContent = params.search;

    // isSaveRecord：1 需要保存，0 不需要保存或者为空
    var isSaveRecord = params.isSaveRecord;

    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }

    if (searchContent == null || searchContent == '' || searchContent == undefined) {
      searchContent = '';
    }

    me.setData({
      searchContent: searchContent,
    });

    // 获取当前的分页数
    var page = me.data.page;
    me.getAllVideoList(page, isSaveRecord);
  },

  // 获取视频列表  
  getAllVideoList: function (page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待，加载中...',
    });

    // 获取查询内容 
    var searchContent = me.data.searchContent;

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: "POST",
      data: {
        videoDesc: searchContent 
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        console.log(res.data);

        // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;

        me.setData({
          videoList: newVideoList.concat(videoList),// 拼接两个对象
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    // 显示导航条加载动画
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },

  // 上拉刷新，获取下一页的视频信息
  onReachBottom:function() {
    var me = this;
    // 当前页数
    var currentPage = me.data.page;
    // 总页数
    var totalPage = me.data.totalPage;

    // 判断当前页数和总页数是否相等，如果想的则无需查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频啦~~',
        icon: "none"
      })
      return;
    }

    // 页数+1
    var page = currentPage + 1;

    me.getAllVideoList(page, 0);
  },

  // 视频展示
  showVideoInfo: function(e) {
    var me = this;
    var videoList = me.data.videoList;

    // 获取下标
    var arrindex = e.target.dataset.arrindex;

    // 需要转为成string类型才可以作为参数传递
    var videoInfo = JSON.stringify(videoList[arrindex]);

    // 跳转到视频展示页面
    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })
  }
})
