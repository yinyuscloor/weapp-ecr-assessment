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
    indicatorPosition: 0,

    // 7点量表选项
    scaleOptions: [],

    // 导航状态
    isLastQuestion: false,

    // 测试信息
    assessment: null
  },

  // 页面加载
  onLoad(options) {
    // 检查是否有传递的起始题目索引
    if (options.startIndex !== undefined) {
      const startIndex = parseInt(options.startIndex);
      if (!isNaN(startIndex) && startIndex >= 0 && startIndex < 36) {
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
    // 检查测试状态
    this.checkTestStatus();
  },

  // 页面卸载
  onUnload() {
    // 自动保存进度
    this.saveProgress();
  },

  // 初始化测试
  initTest() {
    this.setData({ isLoading: true });

    // 获取当前测试
    const assessment = app.getCurrentAssessment();
    if (!assessment) {
      app.startNewAssessment();
      this.loadQuestions();
    } else {
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
        isLoading: false
      });

      // 加载当前题目
      this.loadCurrentQuestion();
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
      indicatorPosition: indicatorPosition
    });
  },

  // 检查测试状态
  checkTestStatus() {
    const assessment = app.getCurrentAssessment();
    if (!assessment) {
      this.redirectToIndex();
      return;
    }

    this.setData({ assessment: assessment });

    // 如果测试已完成，跳转到结果页
    if (assessment.isCompleted) {
      this.navigateToResult();
    }
  },

  // 选择选项
  selectOption(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    const { currentQuestion, responses, isLastQuestion } = this.data;

    if (!currentQuestion || !value) {
      return;
    }

    // 验证答案
    if (!questions.validateResponse(value)) {
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

    // 延迟后根据题目位置决定下一步操作
    setTimeout(() => {
      if (!isLastQuestion) {
        // 非最后一题：自动跳转到下一题
        this.goToNext();
      }
      // 最后一题：等待用户手动点击完成测试
    }, 100);
  },

  // 保存答案到全局
  saveResponse(questionId, response) {
    app.updateAssessmentResponse(questionId - 1, response);
  },

  // 保存进度
  saveProgress() {
    const { assessment, responses } = this.data;
    if (!assessment) return;

    // 更新答案数组
    assessment.responses = responses;
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
      currentQuestionIndex: newIndex
    });

    // 加载新题目
    setTimeout(() => {
      this.loadCurrentQuestion();
    }, 50);
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
      selectedOption: null // 重置选择
    });

    // 加载新题目
    setTimeout(() => {
      this.loadCurrentQuestion();
    }, 50);
  },

  // 完成测试
  completeTest() {
    const { selectedOption, responses } = this.data;

    // 检查当前题目是否已回答
    if (!selectedOption) {
      this.showToast('请先选择答案');
      return;
    }

    // 直接完成测试
    this.finalizeTest();
  },

  // 最终完成测试
  finalizeTest() {
    this.setData({ isLoading: true });

    const { responses } = this.data;

    // 计算测试结果
    try {
      const result = ecrService.calculateResult(responses);

      // 完成测试
      const assessment = app.completeAssessment();
      if (assessment) {
        assessment.result = result;
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
      this.showError('无法显示结果，请重试测试');
      return;
    }

    // 传递结果数据
    const resultJson = JSON.stringify(assessment.result);

    wx.redirectTo({
      url: `/pages/result/result?result=${encodeURIComponent(resultJson)}`,
      fail: () => {
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


  // 错误处理
  onError() {
    // 显示错误提示
    this.showError('测试加载失败，请返回重试');
  }
});