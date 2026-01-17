// ECR评分服务
// 基于ECR-R量表的标准评分算法

const questions = require('./questions.js');

class ECRService {
  constructor() {
    // 题目配置
    this.anxiousItems = questions.ANXIETY_QUESTION_IDS;  // 焦虑题目ID
    this.avoidantItems = questions.AVOIDANCE_QUESTION_IDS; // 回避题目ID
    this.reverseItems = questions.REVERSE_SCORED_IDS;    // 反向计分题目ID
  }

  /**
   * 计算焦虑维度分数
   * @param {Array} responses - 36个题目的答案数组（1-7或null）
   * @returns {number} 焦虑维度平均分（1.0-7.0，保留1位小数）
   */
  calculateAnxiousScore(responses) {
    if (!responses || responses.length !== 36) {
      console.error('答案数组必须包含36个元素');
      return 0;
    }

    let sum = 0;
    let count = 0;

    this.anxiousItems.forEach(itemNum => {
      const response = responses[itemNum - 1]; // 转换为0-based索引
      if (response !== null && response !== undefined) {
        let score = response;

        // 反向计分处理
        if (this.reverseItems.includes(itemNum)) {
          score = 8 - response;
        }

        sum += score;
        count++;
      }
    });

    if (count === 0) {
      return 0;
    }

    const average = sum / count;
    return Number(average.toFixed(1)); // 保留1位小数
  }

  /**
   * 计算回避维度分数
   * @param {Array} responses - 36个题目的答案数组（1-7或null）
   * @returns {number} 回避维度平均分（1.0-7.0，保留1位小数）
   */
  calculateAvoidantScore(responses) {
    if (!responses || responses.length !== 36) {
      console.error('答案数组必须包含36个元素');
      return 0;
    }

    let sum = 0;
    let count = 0;

    this.avoidantItems.forEach(itemNum => {
      const response = responses[itemNum - 1]; // 转换为0-based索引
      if (response !== null && response !== undefined) {
        let score = response;

        // 反向计分处理
        if (this.reverseItems.includes(itemNum)) {
          score = 8 - response;
        }

        sum += score;
        count++;
      }
    });

    if (count === 0) {
      return 0;
    }

    const average = sum / count;
    return Number(average.toFixed(1)); // 保留1位小数
  }

  /**
   * 根据焦虑和回避分数确定依恋类型
   * @param {number} anxious - 焦虑维度分数（1.0-7.0）
   * @param {number} avoidant - 回避维度分数（1.0-7.0）
   * @returns {string} 依恋类型：'secure'/'anxious'/'avoidant'/'disorganized'
   */
  calculateAttachmentStyle(anxious, avoidant) {
    const midpoint = 4.0;

    // 验证输入
    if (typeof anxious !== 'number' || typeof avoidant !== 'number' ||
        anxious < 1 || anxious > 7 || avoidant < 1 || avoidant > 7) {
      console.warn('无效的维度分数，返回安全型作为默认值');
      return 'secure';
    }

    // 依恋类型判断（以4.0为分界点）
    if (anxious < midpoint && avoidant < midpoint) {
      return 'secure';      // 安全型：焦虑<4且回避<4
    } else if (anxious >= midpoint && avoidant < midpoint) {
      return 'anxious';     // 焦虑型：焦虑≥4且回避<4
    } else if (anxious < midpoint && avoidant >= midpoint) {
      return 'avoidant';    // 回避型：焦虑<4且回避≥4
    } else {
      return 'disorganized'; // 混乱型：焦虑≥4且回避≥4
    }
  }

  /**
   * 计算完整的测试结果
   * @param {Array} responses - 36个题目的答案数组
   * @returns {Object} 完整结果对象
   */
  calculateResult(responses) {
    // 验证答案数组
    if (!responses || responses.length !== 36) {
      throw new Error('答案数组必须包含36个元素');
    }

    // 检查是否有未回答的题目
    const unanswered = responses.filter(r => r === null || r === undefined).length;
    if (unanswered > 0) {
      console.warn(`有${unanswered}道题目未回答`);
    }

    // 计算维度分数
    const anxious = this.calculateAnxiousScore(responses);
    const avoidant = this.calculateAvoidantScore(responses);

    // 确定依恋类型
    const style = this.calculateAttachmentStyle(anxious, avoidant);

    // 构建结果对象
    const result = {
      // 维度分数
      anxious: anxious,
      avoidant: avoidant,

      // 依恋类型
      style: style,

      // 元数据
      timestamp: new Date(),
      completedAt: new Date(),

      // 详细分数信息
      scores: {
        anxiety: {
          raw: anxious,
          normalized: this.normalizeScore(anxious),
          interpretation: this.interpretDimensionScore('anxiety', anxious)
        },
        avoidance: {
          raw: avoidant,
          normalized: this.normalizeScore(avoidant),
          interpretation: this.interpretDimensionScore('avoidance', avoidant)
        }
      },

      // 答题统计
      statistics: {
        totalQuestions: 36,
        answeredQuestions: 36 - unanswered,
        unansweredQuestions: unanswered,
        completionRate: Math.round(((36 - unanswered) / 36) * 100)
      }
    };

    return result;
  }

  /**
   * 标准化分数（转换为0-100范围）
   * @param {number} score - 原始分数（1.0-7.0）
   * @returns {number} 标准化分数（0-100）
   */
  normalizeScore(score) {
    // 将1.0-7.0映射到0-100
    const normalized = ((score - 1) / 6) * 100;
    return Math.round(normalized);
  }

  /**
   * 解释维度分数
   * @param {string} dimension - 维度：'anxiety'或'avoidance'
   * @param {number} score - 分数（1.0-7.0）
   * @returns {string} 解释文本
   */
  interpretDimensionScore(dimension, score) {
    if (score < 2.5) {
      return dimension === 'anxiety' ? '极低焦虑水平' : '极低回避水平';
    } else if (score < 3.5) {
      return dimension === 'anxiety' ? '较低焦虑水平' : '较低回避水平';
    } else if (score < 4.5) {
      return dimension === 'anxiety' ? '中等焦虑水平' : '中等回避水平';
    } else if (score < 5.5) {
      return dimension === 'anxiety' ? '较高焦虑水平' : '较高回避水平';
    } else {
      return dimension === 'anxiety' ? '极高焦虑水平' : '极高回避水平';
    }
  }

  /**
   * 验证单个答案
   * @param {number} questionId - 题目ID（1-36）
   * @param {number} response - 答案（1-7）
   * @returns {boolean} 是否有效
   */
  validateResponse(questionId, response) {
    return (
      questionId >= 1 && questionId <= 36 &&
      response >= 1 && response <= 7
    );
  }

  /**
   * 计算测试进度
   * @param {Array} responses - 答案数组
   * @returns {number} 进度百分比（0-100）
   */
  calculateProgress(responses) {
    if (!responses || responses.length !== 36) {
      return 0;
    }

    const answered = responses.filter(r => r !== null && r !== undefined).length;
    const progress = Math.round((answered / 36) * 100);
    return progress;
  }

  /**
   * 获取下一题ID
   * @param {Array} responses - 答案数组
   * @param {number} currentQuestionId - 当前题目ID
   * @returns {number|null} 下一题ID，如果没有则返回null
   */
  getNextQuestionId(responses, currentQuestionId) {
    if (!responses || responses.length !== 36) {
      return 1; // 从第一题开始
    }

    // 如果当前题目未回答，返回当前题目
    if (responses[currentQuestionId - 1] === null ||
        responses[currentQuestionId - 1] === undefined) {
      return currentQuestionId;
    }

    // 寻找下一道未回答的题目
    for (let i = currentQuestionId; i <= 36; i++) {
      if (responses[i - 1] === null || responses[i - 1] === undefined) {
        return i;
      }
    }

    // 如果所有题目都已回答，返回null表示完成
    return null;
  }

  /**
   * 获取上一题ID
   * @param {Array} responses - 答案数组
   * @param {number} currentQuestionId - 当前题目ID
   * @returns {number|null} 上一题ID，如果没有则返回null
   */
  getPreviousQuestionId(responses, currentQuestionId) {
    if (!responses || responses.length !== 36 || currentQuestionId <= 1) {
      return null;
    }

    // 寻找上一道题目
    for (let i = currentQuestionId - 1; i >= 1; i--) {
      return i;
    }

    return null;
  }

  /**
   * 生成简短结果摘要
   * @param {Object} result - 完整结果对象
   * @returns {Object} 摘要对象
   */
  generateSummary(result) {
    const { style, anxious, avoidant } = result;

    const summaries = {
      secure: {
        title: '安全型依恋',
        description: '您在关系中感到安全和舒适，能够平衡独立性和亲密性。',
        icon: 'shield-check'
      },
      anxious: {
        title: '焦虑型依恋',
        description: '您渴望与伴侣建立深度连接，但容易担心被抛弃。',
        icon: 'heart-pulse'
      },
      avoidant: {
        title: '回避型依恋',
        description: '您重视个人独立性，在情感表达上较为保守。',
        icon: 'user-shield'
      },
      disorganized: {
        title: '混乱型依恋',
        description: '您在关系中体验到矛盾情感，既渴望亲密又害怕受伤。',
        icon: 'brain'
      }
    };

    const summary = summaries[style] || summaries.secure;

    return {
      ...summary,
      scores: {
        anxiety: anxious,
        avoidance: avoidant
      },
      recommendation: this.generateRecommendation(style, anxious, avoidant)
    };
  }

  /**
   * 生成推荐建议
   * @param {string} style - 依恋类型
   * @param {number} anxious - 焦虑分数
   * @param {number} avoidant - 回避分数
   * @returns {string} 推荐建议
   */
  generateRecommendation(style, anxious, avoidant) {
    const recommendations = {
      secure: '继续保持健康的关系模式，您的依恋风格非常稳定和安全。',
      anxious: '尝试练习自我安抚技巧，减少对关系确认的过度依赖。',
      avoidant: '逐步练习情感表达，学习在关系中适度依赖他人。',
      disorganized: '考虑寻求专业帮助，探索和处理情感矛盾的根本原因。'
    };

    let recommendation = recommendations[style] || recommendations.secure;

    // 根据具体分数调整建议
    if (anxious > 5.0) {
      recommendation += ' 高焦虑水平提示您可能需要学习更好的情绪调节策略。';
    }
    if (avoidant > 5.0) {
      recommendation += ' 高回避水平可能影响您建立深度情感连接的能力。';
    }

    return recommendation;
  }

  /**
   * 计算维度分数解释
   * @param {string} dimension - 维度名称
   * @param {number} score - 分数
   * @returns {Object} 解释对象
   */
  getDimensionExplanation(dimension, score) {
    const explanations = {
      anxiety: {
        low: '您对被抛弃或拒绝的担心程度较低，对关系有较强的安全感。',
        medium: '您对关系有一定的担忧，但整体上能够保持相对稳定的情感状态。',
        high: '您对被抛弃或拒绝有较强的担心，可能需要更多的关系确认和安全感。'
      },
      avoidance: {
        low: '您对情感亲密感到舒适，能够自然地表达情感需求和依赖他人。',
        medium: '您在亲密和独立之间保持平衡，能够根据情境调整自己的情感表达。',
        high: '您倾向于保持情感距离，在表达深层情感和依赖他人方面可能感到困难。'
      }
    };

    let level = 'medium';
    if (score < 3.0) level = 'low';
    if (score > 5.0) level = 'high';

    return {
      dimension: dimension === 'anxiety' ? '焦虑维度' : '回避维度',
      score: score,
      level: level,
      explanation: explanations[dimension][level],
      interpretation: this.interpretDimensionScore(dimension, score)
    };
  }
}

// 创建单例实例
const ecrService = new ECRService();

// 导出单例
module.exports = ecrService;