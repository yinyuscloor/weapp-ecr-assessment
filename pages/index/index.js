// pages/index/index.js - 首页逻辑

// 获取应用实例
const app = getApp();

Page({
  // 页面数据
  data: {
    // 页面状态
    isLoading: false,

    // 用户信息
    userInfo: null,
    hasUserInfo: false,

    // 动画状态
    animationClass: 'fade-in',

    // 模态框状态
    showTestModal: false,
    showContinueTestModal: false,

    // 当前测试信息（用于继续测试弹窗）
    currentAssessment: null,
    continueTestProgress: 0
  },

  // 页面加载
  onLoad(options) {
    console.log('首页加载', options);

    // 获取用户信息
    this.getUserInfo();

    // 设置页面动画
    this.setPageAnimation();

    // 检查是否有进行中的测试
    this.checkActiveAssessment();
  },

  // 页面显示
  onShow() {
    console.log('首页显示');

    // 更新动画
    this.setData({
      animationClass: 'fade-in'
    });

    // 检查测试状态
    this.checkTestStatus();
  },

  // 页面初次渲染完成
  onReady() {
    console.log('首页渲染完成');
  },

  // 页面隐藏
  onHide() {
    console.log('首页隐藏');
  },

  // 页面卸载
  onUnload() {
    console.log('首页卸载');
  },

  // 获取用户信息
  getUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else {
      // 获取用户信息
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        },
        fail: (err) => {
          console.log('获取用户信息失败:', err);
          this.setData({
            hasUserInfo: false
          });
        }
      });
    }
  },

  // 设置页面动画
  setPageAnimation() {
    // 可以在这里设置更复杂的动画逻辑
    setTimeout(() => {
      this.setData({
        animationClass: 'fade-in slide-up'
      });
    }, 100);
  },

  // 检查活跃的测试
  checkActiveAssessment() {
    const assessment = app.getCurrentAssessment();
    if (assessment && !assessment.isCompleted) {
      console.log('有进行中的测试:', assessment.id);

      // 可以提示用户继续测试
      this.showContinueTestDialog(assessment);
    }
  },

  // 检查测试状态
  checkTestStatus() {
    const assessment = app.getCurrentAssessment();
    if (assessment && assessment.isCompleted) {
      console.log('有已完成的测试');

      // 可以提示用户查看结果
      this.showViewResultOption();
    }
  },

  // 显示继续测试对话框
  showContinueTestDialog(assessment) {
    const answeredCount = assessment.responses.filter(r => r !== null).length;
    const progress = Math.round((answeredCount / 36) * 100);

    // 保存当前测试信息并显示弹窗
    this.setData({
      currentAssessment: assessment,
      continueTestProgress: progress,
      showContinueTestModal: true
    });
  },

  // 显示查看结果选项
  showViewResultOption() {
    // 这里可以添加提示用户查看最近结果的逻辑
    console.log('显示查看结果选项');
  },

  // 开始测试 - 主要功能
  startTest() {
    console.log('开始测试');

    // 检查是否有进行中的测试
    const assessment = app.getCurrentAssessment();
    if (assessment && !assessment.isCompleted) {
      // 有进行中的测试，显示继续测试对话框
      this.showContinueTestDialog(assessment);
      return;
    }

    // 显示自定义模态框（弹窗）
    this.setData({
      showTestModal: true
    });
  },

  // 模态框确认事件
  onModalConfirm() {
    console.log('用户确认开始测试');
    // 关闭模态框
    this.setData({ showTestModal: false });
    // 开始新测试
    this.startNewTest();
  },

  // 模态框取消事件
  onModalCancel() {
    console.log('用户取消开始测试');
    // 关闭模态框
    this.setData({ showTestModal: false });
  },

  // 继续测试弹窗确认事件
  onContinueTestConfirm() {
    console.log('用户选择继续测试');
    // 关闭弹窗
    this.setData({
      showContinueTestModal: false,
      currentAssessment: null,
      continueTestProgress: 0
    });
    // 继续测试
    this.continueTest();
  },

  // 继续测试弹窗取消事件
  onContinueTestCancel() {
    console.log('用户选择重新开始');
    // 关闭弹窗
    this.setData({
      showContinueTestModal: false,
      currentAssessment: null,
      continueTestProgress: 0
    });
    // 重新开始测试
    this.startNewTest();
  },

  // 继续测试
  continueTest() {
    console.log('继续测试');

    // 获取下一个未回答题目的索引
    const nextQuestionIndex = app.getNextQuestionIndex();
    console.log('下一个未回答题目的索引:', nextQuestionIndex);

    this.setData({ isLoading: true });

    setTimeout(() => {
      this.setData({ isLoading: false });

      // 传递起始题目索引给测试页
      wx.navigateTo({
        url: `/pages/test/test?startIndex=${nextQuestionIndex}`,
        success: () => {
          console.log('跳转到测试页继续测试，从第', nextQuestionIndex + 1, '题开始');
        }
      });
    }, 500);
  },

  // 开始新测试（覆盖现有）
  startNewTest() {
    console.log('开始新测试（覆盖）');

    // 重置现有测试
    app.resetAssessment();

    // 直接跳转到测试页面
    this.setData({ isLoading: true });

    setTimeout(() => {
      this.setData({ isLoading: false });

      wx.navigateTo({
        url: '/pages/test/test',
        success: () => {
          console.log('跳转到测试页开始新测试');
        }
      });
    }, 500);
  },

  // 跳转到结果页面
  goToResults() {
    console.log('跳转到结果页面');

    wx.navigateTo({
      url: '/pages/result/result',
      success: () => {
        console.log('跳转到结果页面成功');
      },
      fail: (error) => {
        console.error('跳转到结果页面失败:', error);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'error'
        });
      }
    });
  },

  // 分享到聊天
  onShareAppMessage() {
    return {
      title: 'ECR依恋型人格测试 - 了解你的亲密关系模式',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.jpg'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'ECR依恋测试 | 科学分析你的依恋风格',
      query: 'from=timeline',
      imageUrl: '/assets/images/share.jpg',
    };
  },

  // 页面滚动
  onPageScroll(e) {
    // 可以在这里实现滚动相关效果
    console.log('页面滚动:', e.scrollTop);
  },

  // 页面到底部
  onReachBottom() {
    console.log('页面到底部');
  },

  // 页面下拉刷新
  onPullDownRefresh() {
    console.log('页面下拉刷新');

    // 停止下拉刷新
    wx.stopPullDownRefresh();

    // 显示刷新完成提示
    wx.showToast({
      title: '刷新完成',
      icon: 'success',
      duration: 1000
    });
  },

  // 错误处理
  onError(error) {
    console.error('页面错误:', error);

    // 显示错误提示
    wx.showToast({
      title: '加载失败，请重试',
      icon: 'error',
      duration: 2000
    });
  }
});