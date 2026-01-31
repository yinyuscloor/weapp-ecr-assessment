// app.js - ECR依恋测试小程序入口文件

App({
  // 全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    testInProgress: false,
    currentAssessment: null
  },

  // 小程序初始化完成时触发
  onLaunch(options) {
    console.log('ECR依恋测试小程序初始化完成');

    // 获取系统信息
    this.getSystemInfo();

    // 检查更新
    this.checkForUpdates();

    // 初始化设计系统
    this.initDesignSystem();
  },

  // 小程序启动，或从后台进入前台显示时触发
  onShow(options) {
    console.log('小程序显示');
  },

  // 小程序从前台进入后台时触发
  onHide() {
    console.log('小程序隐藏');
  },

  // 小程序发生脚本错误或 API 调用报错时触发
  onError(error) {
    console.error('小程序错误:', error);
  },

  // 页面不存在监听函数
  onPageNotFound(res) {
    console.warn('页面不存在:', res.path);

    // 重定向到首页
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  // 获取系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      console.log('系统信息:', systemInfo);

      // 根据系统信息调整设计
      this.adjustDesignForSystem(systemInfo);
    } catch (error) {
      console.error('获取系统信息失败:', error);
    }
  },

  // 根据系统信息调整设计
  adjustDesignForSystem(systemInfo) {
    // 可以根据设备类型调整设计
    const { platform, screenWidth, screenHeight, pixelRatio } = systemInfo;

    // 存储设备信息供页面使用
    this.globalData.deviceType = platform === 'ios' ? 'ios' : 'android';
    this.globalData.screenWidth = screenWidth;
    this.globalData.screenHeight = screenHeight;
    this.globalData.pixelRatio = pixelRatio;
  },

  // 检查更新
  checkForUpdates() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate(function(res) {
        console.log('检查更新结果:', res.hasUpdate);
      });

      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(function() {
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
      });
    }
  },

  // 初始化设计系统
  initDesignSystem() {
    // 这里可以初始化一些设计相关的设置
    console.log('设计系统初始化完成');
  },

  // 工具函数：显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 工具函数：隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 工具函数：显示提示消息
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    });
  },

  // 工具函数：显示模态对话框
  showModal(title, content, showCancel = true) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: title,
        content: content,
        showCancel: showCancel,
        success: (res) => {
          resolve(res.confirm);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 开始新的测试
  startNewAssessment() {
    const assessment = {
      id: `ecr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      responses: new Array(36).fill(null),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted: false,
      result: null
    };

    this.globalData.currentAssessment = assessment;
    this.globalData.testInProgress = true;

    console.log('开始新测试:', assessment.id);
    return assessment;
  },

  // 获取当前测试
  getCurrentAssessment() {
    return this.globalData.currentAssessment;
  },

  // 更新测试答案
  updateAssessmentResponse(questionIndex, response) {
    if (!this.globalData.currentAssessment) {
      console.error('没有进行中的测试');
      return false;
    }

    const assessment = this.globalData.currentAssessment;

    if (questionIndex >= 0 && questionIndex < 36) {
      assessment.responses[questionIndex] = response;
      assessment.updatedAt = new Date();

      // 检查是否完成
      const isCompleted = assessment.responses.every(r => r !== null);
      assessment.isCompleted = isCompleted;

      console.log(`更新问题 ${questionIndex + 1} 的答案:`, response);
      return true;
    }

    return false;
  },

  // 完成测试
  completeAssessment() {
    if (!this.globalData.currentAssessment) {
      console.error('没有进行中的测试');
      return null;
    }

    const assessment = this.globalData.currentAssessment;
    assessment.isCompleted = true;
    assessment.completedAt = new Date();
    this.globalData.testInProgress = false;

    console.log('测试完成:', assessment.id);
    return assessment;
  },

  // 重置测试
  resetAssessment() {
    this.globalData.currentAssessment = null;
    this.globalData.testInProgress = false;
    console.log('测试已重置');
  },

  // 获取测试进度
  getAssessmentProgress() {
    if (!this.globalData.currentAssessment) {
      return 0;
    }

    const assessment = this.globalData.currentAssessment;
    const answeredCount = assessment.responses.filter(r => r !== null).length;
    const progress = Math.round((answeredCount / 36) * 100);

    return progress;
  },

  // 获取下一个未回答题目的索引（在ORDERED_QUESTIONS中的位置）
  getNextQuestionIndex() {
    if (!this.globalData.currentAssessment) {
      return 0; // 没有测试，从第一题开始
    }

    const assessment = this.globalData.currentAssessment;
    const responses = assessment.responses;

    // 找到第一个未回答的题目（null值）
    for (let i = 0; i < responses.length; i++) {
      if (responses[i] === null || responses[i] === undefined) {
        return i; // 返回在ORDERED_QUESTIONS中的索引
      }
    }

    // 如果所有题目都已回答，返回最后一个题目的索引
    return responses.length - 1;
  },

  // 分享到聊天
  onShareAppMessage(options) {
    return {
      title: 'ECR依恋型人格测试',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-cover.svg'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'ECR依恋型人格测试 - 了解你的依恋风格',
      query: 'from=timeline',
      imageUrl: '/assets/images/share-cover.svg'
    };
  },

  // 添加到我的小程序
  onAddToFavorites() {
    return {
      title: 'ECR依恋测试',
      imageUrl: '/assets/images/favorite-icon.svg',
      query: 'from=favorites'
    };
  }
});