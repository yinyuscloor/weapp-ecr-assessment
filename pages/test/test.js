// pages/test/test.js - 测试页逻辑

// 获取应用实例
const app = getApp();

// 导入工具模块
const questions = require('../../utils/questions.js');
const ecrService = require('../../utils/ecrService.js');

Page({
  // 页面数据
  data: {
    // 测试状态
    isLoading: false,
    isInitialized: false,

    // 题目数据
    questions: [],
    totalQuestions: 36,

    // 当前题目状态
    currentQuestionIndex: 0,
    currentQuestion: {},
    selectedOption: null,

    // 答案数据
    responses: new Array(36).fill(null),

    // 进度信息
    progress: 0,
    indicatorPosition: 0,

    // 7点量表选项
    scaleOptions: [],

    // 导航状态
    isLastQuestion: false,

    // 动画类
    animationClass: 'slide-in-right',

    // 测试信息
    assessment: null
  },

  // 页面加载
  onLoad(options) {
    console.log('测试页加载', options);

    // 检查是否有传递的起始题目索引
    if (options.startIndex !== undefined) {
      const startIndex = parseInt(options.startIndex);
      if (!isNaN(startIndex) && startIndex >= 0 && startIndex < 36) {
        console.log('设置起始题目索引:', startIndex);
        this.setData({
          currentQuestionIndex: startIndex
        });
      }
    }

    // 初始化测试
    this.initTest();
  },

  // 页面显示
  onShow() {
    console.log('测试页显示');

    // 检查测试状态
    this.checkTestStatus();

    // 更新进度
    this.updateProgress();
  },

  // 页面卸载
  onUnload() {
    console.log('测试页卸载');

    // 自动保存进度
    this.saveProgress();
  },

  // 初始化测试
  initTest() {
    this.setData({ isLoading: true });

    // 获取当前测试
    const assessment = app.getCurrentAssessment();
    if (!assessment) {
      console.log('没有进行中的测试，创建新测试');
      app.startNewAssessment();
      this.loadQuestions();
    } else {
      console.log('继续现有测试:', assessment.id);
      this.setData({
        assessment: assessment,
        responses: assessment.responses
      });
      this.loadQuestions();
    }
  },

  // 加载题目数据
  loadQuestions() {
    try {
      // 获取题目
      const orderedQuestions = questions.getOrderedQuestions();
      const scaleLabels = questions.SCALE_LABELS;

      // 准备量表选项
      const scaleOptions = Object.keys(scaleLabels).map(value => ({
        value: parseInt(value),
        label: scaleLabels[value]
      }));

      this.setData({
        questions: orderedQuestions,
        totalQuestions: orderedQuestions.length,
        scaleOptions: scaleOptions,
        isInitialized: true,
        isLoading: false
      });

      // 加载当前题目
      this.loadCurrentQuestion();

      console.log('题目加载完成，共', orderedQuestions.length, '题');
    } catch (error) {
      console.error('加载题目失败:', error);
      this.showError('加载题目失败，请重试');
      this.setData({ isLoading: false });
    }
  },

  // 加载当前题目
  loadCurrentQuestion() {
    const { questions, currentQuestionIndex, responses } = this.data;

    if (!questions || questions.length === 0) {
      console.error('题目数据未加载');
      return;
    }

    // 获取当前题目
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error('当前题目不存在');
      return;
    }

    // 获取当前题目的答案
    const questionId = currentQuestion.id;
    const selectedOption = responses[questionId - 1] || null;

    // 检查是否为最后一题
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // 计算指示器位置
    const totalQuestions = questions.length;
    const indicatorPosition = totalQuestions > 1
      ? (currentQuestionIndex / (totalQuestions - 1)) * 100
      : 0;

    this.setData({
      currentQuestion: currentQuestion,
      selectedOption: selectedOption,
      isLastQuestion: isLastQuestion,
      animationClass: 'fade-in',
      indicatorPosition: indicatorPosition
    });

    console.log(`加载第${currentQuestionIndex + 1}题:`, currentQuestion.text);
  },

  // 检查测试状态
  checkTestStatus() {
    const assessment = app.getCurrentAssessment();
    if (!assessment) {
      console.warn('测试不存在，返回首页');
      this.redirectToIndex();
      return;
    }

    this.setData({ assessment: assessment });

    // 如果测试已完成，跳转到结果页
    if (assessment.isCompleted) {
      console.log('测试已完成，跳转到结果页');
      this.navigateToResult();
    }
  },

  // 选择选项
  selectOption(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    const { currentQuestion, responses, isLastQuestion } = this.data;

    if (!currentQuestion || !value) {
      console.error('选择选项失败: 无效的参数');
      return;
    }

    // 验证答案
    if (!questions.validateResponse(value)) {
      console.error('无效的答案:', value);
      return;
    }

    // 更新答案
    const questionId = currentQuestion.id;
    responses[questionId - 1] = value;

    this.setData({
      selectedOption: value,
      responses: responses
    });

    // 保存到全局
    this.saveResponse(questionId, value);

    // 更新进度
    this.updateProgress();

    console.log(`问题 ${questionId} 选择答案:`, value);

    // 延迟后根据题目位置决定下一步操作
    setTimeout(() => {
      if (isLastQuestion) {
        // 最后一题：等待用户手动点击完成测试
        console.log(`问题 ${questionId} 已回答，等待用户点击完成测试`);
      } else {
        // 非最后一题：自动跳转到下一题
        this.goToNext();
      }
    }, 300); // 300毫秒延迟，让用户看到选中效果
  },

  // 保存答案到全局
  saveResponse(questionId, response) {
    const success = app.updateAssessmentResponse(questionId - 1, response);
    if (success) {
      console.log('答案已保存到全局');
    } else {
      console.error('保存答案失败');
    }
  },

  // 保存进度
  saveProgress() {
    const { assessment, responses } = this.data;
    if (!assessment) return;

    // 更新答案数组
    assessment.responses = responses;

    console.log('进度已保存');
  },

  // 更新进度
  updateProgress() {
    const { responses } = this.data;
    const progress = ecrService.calculateProgress(responses);

    this.setData({ progress: progress });

    console.log('进度更新:', progress + '%');
  },

  // 跳转到上一题
  goToPrevious() {
    const { currentQuestionIndex } = this.data;

    if (currentQuestionIndex === 0) {
      return; // 已经是第一题
    }

    // 保存当前答案
    this.saveProgress();

    // 更新题目索引
    const newIndex = currentQuestionIndex - 1;

    this.setData({
      currentQuestionIndex: newIndex,
      animationClass: 'slide-in-left'
    });

    // 加载新题目
    setTimeout(() => {
      this.loadCurrentQuestion();
    }, 50);

    console.log('跳转到上一题，新索引:', newIndex);
  },

  // 跳转到下一题
  goToNext() {
    const { currentQuestionIndex, selectedOption, questions } = this.data;

    if (!selectedOption) {
      this.showToast('请先选择答案');
      return;
    }

    if (currentQuestionIndex >= questions.length - 1) {
      return; // 已经是最后一题
    }

    // 保存当前答案
    this.saveProgress();

    // 更新题目索引
    const newIndex = currentQuestionIndex + 1;

    this.setData({
      currentQuestionIndex: newIndex,
      selectedOption: null, // 重置选择
      animationClass: 'slide-in-right'
    });

    // 加载新题目
    setTimeout(() => {
      this.loadCurrentQuestion();
    }, 50);

    console.log('跳转到下一题，新索引:', newIndex);
  },

  // 完成测试
  completeTest() {
    const { selectedOption, responses } = this.data;

    // 检查当前题目是否已回答
    if (!selectedOption) {
      this.showToast('请先选择答案');
      return;
    }

    // 检查是否所有题目都已回答
    const unanswered = responses.filter(r => r === null || r === undefined).length;

    if (unanswered > 0) {
      // 有未回答的题目，直接完成测试
      console.log(`有${unanswered}道题目未回答，直接完成测试`);
      this.finalizeTest();
    } else {
      // 所有题目都已回答，直接完成测试
      console.log('所有题目已回答，完成测试');
      this.finalizeTest();
    }
  },

  // 最终完成测试
  finalizeTest() {
    this.setData({ isLoading: true });

    const { responses } = this.data;

    // 计算测试结果
    try {
      const result = ecrService.calculateResult(responses);
      console.log('测试结果计算完成:', result);

      // 完成测试
      const assessment = app.completeAssessment();
      if (assessment) {
        assessment.result = result;
        console.log('测试已完成:', assessment.id);
      }

      // 跳转到结果页
      setTimeout(() => {
        this.setData({ isLoading: false });
        this.navigateToResult();
      }, 500);

    } catch (error) {
      console.error('计算测试结果失败:', error);
      this.setData({ isLoading: false });
      this.showError('计算结果失败，请重试');
    }
  },

  // 跳转到结果页
  navigateToResult() {
    const assessment = app.getCurrentAssessment();
    if (!assessment || !assessment.result) {
      console.error('没有测试结果');
      this.showError('无法显示结果，请重试测试');
      return;
    }

    // 传递结果数据
    const resultJson = JSON.stringify(assessment.result);

    wx.redirectTo({
      url: `/pages/result/result?result=${encodeURIComponent(resultJson)}`,
      fail: (error) => {
        console.error('跳转到结果页失败:', error);
        this.showError('跳转失败，请重试');
      }
    });
  },

  // 返回首页
  redirectToIndex() {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  // 显示确认对话框
  showConfirm(title, content, confirmCallback, cancelCallback) {
    wx.showModal({
      title: title,
      content: content,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          confirmCallback && confirmCallback();
        } else if (res.cancel) {
          cancelCallback && cancelCallback();
        }
      }
    });
  },

  // 显示提示
  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 显示错误
  showError(message) {
    wx.showModal({
      title: '错误',
      content: message,
      showCancel: false,
      confirmText: '确定',
      success: () => {
        // 错误后返回首页
        this.redirectToIndex();
      }
    });
  },

  // 分享到聊天
  onShareAppMessage() {
    return {
      title: '我正在参加ECR依恋测试',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-cover.svg'
    };
  },

  // 页面下拉刷新
  onPullDownRefresh() {
    console.log('测试页下拉刷新');

    // 重新加载题目
    this.loadQuestions();

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
    console.error('测试页错误:', error);

    // 显示错误提示
    this.showError('测试加载失败，请返回重试');
  }
});