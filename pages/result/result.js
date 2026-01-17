// pages/result/result.js - 结果页逻辑

// 获取应用实例
const app = getApp();

// 导入工具模块
const descriptions = require('../../utils/descriptions.js');
const ecrService = require('../../utils/ecrService.js');

Page({
  // 页面数据
  data: {
    // 加载状态
    isLoading: true,
    hasError: false,
    errorMessage: '',

    // 结果数据
    result: null,
    resultSummary: {
      title: '安全型依恋',
      subtitle: '您拥有健康稳定的依恋模式',
      summary: '加载中...',
      label: '安全型',
      color: '#10b981',
      bgColor: '#d1fae5',
      textColor: '#3E2723'
    },

    // 分数数据
    scores: {
      anxiety: {
        raw: 0,
        normalized: 0,
        interpretation: '加载中...'
      },
      avoidance: {
        raw: 0,
        normalized: 0,
        interpretation: '加载中...'
      }
    },

    // 依恋类型
    attachmentStyle: 'secure',

    // 详细内容
    characteristics: [],
    growthSuggestions: [],
    relationshipPatterns: [],
    compatibilityNotes: [],

    // 展开/收起状态
    showCharacteristics: true,
    showSuggestions: false,
    showPatterns: false,
    showCompatibility: false,

    // 测试信息
    testInfo: {
      timestamp: null,
      completionRate: 0,
      totalQuestions: 36,
      answeredQuestions: 0
    }
  },

  // 页面加载
  onLoad(options) {
    console.log('结果页加载', options);

    // 检查是否有示例模式
    if (options.sample === 'true') {
      console.log('加载示例结果');
      this.loadSampleResult();
      return;
    }

    // 检查是否有传递的结果数据
    if (options.result) {
      try {
        const resultData = JSON.parse(decodeURIComponent(options.result));
        console.log('从URL参数加载结果:', resultData);
        this.processResult(resultData);
        return;
      } catch (error) {
        console.error('解析URL参数失败:', error);
      }
    }

    // 从全局数据加载
    this.loadResultFromGlobal();
  },

  // 页面显示
  onShow() {
    console.log('结果页显示');
  },

  // 从全局数据加载结果
  loadResultFromGlobal() {
    this.setData({ isLoading: true });

    const assessment = app.getCurrentAssessment();
    if (!assessment || !assessment.result) {
      console.error('没有可用的测试结果');
      this.showError('没有找到测试结果，请先完成测试');
      return;
    }

    console.log('从全局数据加载结果:', assessment.result);
    this.processResult(assessment.result);
  },

  // 加载示例结果
  loadSampleResult() {
    this.setData({ isLoading: true });

    // 创建示例数据
    const sampleResult = {
      anxious: 3.2,
      avoidant: 2.8,
      style: 'secure',
      scores: {
        anxiety: {
          raw: 3.2,
          normalized: 37,
          interpretation: '较低焦虑水平'
        },
        avoidance: {
          raw: 2.8,
          normalized: 30,
          interpretation: '较低回避水平'
        }
      },
      statistics: {
        totalQuestions: 36,
        answeredQuestions: 36,
        unansweredQuestions: 0,
        completionRate: 100
      },
      timestamp: new Date()
    };

    // 模拟加载延迟
    setTimeout(() => {
      this.processResult(sampleResult);
    }, 800);
  },

  // 处理结果数据
  processResult(resultData) {
    try {
      console.log('处理结果数据:', resultData);

      // 提取主要数据
      const { anxious, avoidant, style, scores, statistics } = resultData;

      // 获取依恋类型描述
      const description = descriptions.getDescription(style);
      const label = descriptions.getLabel(style);

      // 构建结果摘要
      const resultSummary = {
        title: description.title,
        subtitle: description.subtitle,
        summary: description.summary,
        label: label.label,
        color: label.color,
        bgColor: label.bgColor,
        textColor: label.textColor
      };

      // 构建分数数据
      const scoresData = {
        anxiety: scores?.anxiety || {
          raw: anxious,
          normalized: ecrService.normalizeScore(anxious),
          interpretation: ecrService.interpretDimensionScore('anxiety', anxious)
        },
        avoidance: scores?.avoidance || {
          raw: avoidant,
          normalized: ecrService.normalizeScore(avoidant),
          interpretation: ecrService.interpretDimensionScore('avoidance', avoidant)
        }
      };

      // 获取详细内容
      const characteristics = description.characteristics.slice(0, 5);
      const growthSuggestions = description.growthSuggestions.slice(0, 3);
      const relationshipPatterns = description.relationshipPatterns.slice(0, 3);
      const compatibilityNotes = description.compatibilityNotes.slice(0, 2);

      // 更新数据
      this.setData({
        isLoading: false,
        hasError: false,
        result: resultData,
        resultSummary: resultSummary,
        scores: scoresData,
        attachmentStyle: style,
        characteristics: characteristics,
        growthSuggestions: growthSuggestions,
        relationshipPatterns: relationshipPatterns,
        compatibilityNotes: compatibilityNotes,
        testInfo: {
          timestamp: resultData.timestamp || new Date(),
          completionRate: statistics?.completionRate || 100,
          totalQuestions: statistics?.totalQuestions || 36,
          answeredQuestions: statistics?.answeredQuestions || 36
        }
      });

      console.log('结果处理完成，依恋类型:', style);

    } catch (error) {
      console.error('处理结果数据失败:', error);
      this.showError('处理结果数据时发生错误');
    }
  },

  // 显示错误
  showError(message) {
    this.setData({
      isLoading: false,
      hasError: true,
      errorMessage: message || '加载结果失败，请稍后重试'
    });
  },

  // 重试加载
  retryLoading() {
    this.setData({ hasError: false, isLoading: true });
    this.loadResultFromGlobal();
  },

  // 切换特性显示
  toggleCharacteristics() {
    this.setData({
      showCharacteristics: !this.data.showCharacteristics
    });
  },

  // 切换建议显示
  toggleSuggestions() {
    this.setData({
      showSuggestions: !this.data.showSuggestions
    });
  },

  // 切换模式显示
  togglePatterns() {
    this.setData({
      showPatterns: !this.data.showPatterns
    });
  },

  // 切换兼容性显示
  toggleCompatibility() {
    this.setData({
      showCompatibility: !this.data.showCompatibility
    });
  },

  // 重新测试
  retakeTest() {
    console.log('重新测试');

    // 显示确认对话框
    wx.showModal({
      title: '重新测试',
      content: '确定要开始新的测试吗？当前结果将被覆盖。',
      confirmText: '开始新测试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 重置测试状态
          app.resetAssessment();

          // 跳转到首页
          wx.reLaunch({
            url: '/pages/index/index',
            success: () => {
              console.log('跳转到首页成功');
            }
          });
        }
      }
    });
  },

  // 分享结果
  shareResult() {
    console.log('分享结果');

    // 生成分享摘要
    const { resultSummary, scores } = this.data;
    const shareText = `我的ECR依恋测试结果：${resultSummary.title}\n` +
                     `焦虑维度：${scores.anxiety.raw}分 (${scores.anxiety.interpretation})\n` +
                     `回避维度：${scores.avoidance.raw}分 (${scores.avoidance.interpretation})\n` +
                     `测试结果：${resultSummary.summary.substring(0, 60)}...`;

    // 设置剪切板
    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showToast({
          title: '结果已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 保存结果图片（占位功能）
  saveResultImage() {
    wx.showToast({
      title: '保存图片功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 复制结果链接
  copyResultLink() {
    const link = 'https://weapp.example.com/ecr-assessment';
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  // 分享到聊天
  onShareAppMessage() {
    const { resultSummary, scores } = this.data;

    return {
      title: `我的ECR依恋测试结果：${resultSummary.label}`,
      path: '/pages/result/result',
      imageUrl: '/assets/images/share-result.svg',
      success: () => {
        console.log('分享成功');
      },
      fail: (error) => {
        console.error('分享失败:', error);
      }
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { resultSummary } = this.data;

    return {
      title: `ECR依恋测试 - ${resultSummary.title}`,
      query: 'from=timeline',
      imageUrl: '/assets/images/share-timeline.svg'
    };
  },

  // 页面下拉刷新
  onPullDownRefresh() {
    console.log('结果页下拉刷新');

    // 重新加载结果
    this.loadResultFromGlobal();

    // 停止下拉刷新
    wx.stopPullDownRefresh();

    // 显示刷新完成提示
    wx.showToast({
      title: '刷新完成',
      icon: 'success',
      duration: 1000
    });
  },

  // 页面到底部
  onReachBottom() {
    console.log('页面到底部');
    // 可以在这里加载更多内容
  },

  // 页面卸载
  onUnload() {
    console.log('结果页卸载');
  },

  // 错误处理
  onError(error) {
    console.error('结果页错误:', error);
    this.showError('页面发生错误，请重试');
  }
});