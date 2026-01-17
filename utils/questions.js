// ECR-R (Experiences in Close Relationships-Revised) 量表36题
// 基于 Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000) 的标准版本

// 36道ECR题目
const ECR_QUESTIONS = [
  // 焦虑依恋维度题目 (奇数题目)
  {
    id: 1,
    text: '我担心被抛弃。',
    dimension: 'anxiety',
    reverse: false,
    order: 1
  },
  {
    id: 3,
    text: '我经常担心恋人不再爱我了。',
    dimension: 'anxiety',
    reverse: false,
    order: 3
  },
  {
    id: 5,
    text: '我担心独自一人。',
    dimension: 'anxiety',
    reverse: false,
    order: 5
  },
  {
    id: 7,
    text: '我经常担心恋人对我的关心不如我对他们的关心。',
    dimension: 'anxiety',
    reverse: false,
    order: 7
  },
  {
    id: 9,
    text: '我很少担心被抛弃。',
    dimension: 'anxiety',
    reverse: true,
    order: 9
  },
  {
    id: 11,
    text: '我不经常担心有人会离开我。',
    dimension: 'anxiety',
    reverse: true,
    order: 11
  },
  {
    id: 13,
    text: '当恋人不在身边时，我感到有些焦虑。',
    dimension: 'anxiety',
    reverse: false,
    order: 13
  },
  {
    id: 15,
    text: '我需要从恋人那里得到很多安慰。',
    dimension: 'anxiety',
    reverse: false,
    order: 15
  },
  {
    id: 17,
    text: '我想要与某人非常亲近，但这有时会把人吓跑。',
    dimension: 'anxiety',
    reverse: false,
    order: 17
  },
  {
    id: 19,
    text: '我担心独自一人。',
    dimension: 'anxiety',
    reverse: false,
    order: 19
  },
  {
    id: 21,
    text: '当我表现出感情时，我害怕恋人不会有同样的感受。',
    dimension: 'anxiety',
    reverse: false,
    order: 21
  },
  {
    id: 23,
    text: '我很少担心恋人会离开我。',
    dimension: 'anxiety',
    reverse: true,
    order: 23
  },
  {
    id: 25,
    text: '我希望与恋人融为一体。',
    dimension: 'anxiety',
    reverse: false,
    order: 25
  },
  {
    id: 27,
    text: '我的恋人让我怀疑自己。',
    dimension: 'anxiety',
    reverse: false,
    order: 27
  },
  {
    id: 29,
    text: '我不经常担心被抛弃。',
    dimension: 'anxiety',
    reverse: true,
    order: 29
  },
  {
    id: 31,
    text: '当恋人不赞成我做的事情时，我感觉很糟糕。',
    dimension: 'anxiety',
    reverse: false,
    order: 31
  },
  {
    id: 33,
    text: '我担心恋人不会像我关心他们那样关心我。',
    dimension: 'anxiety',
    reverse: false,
    order: 33
  },
  {
    id: 35,
    text: '当恋人不在身边时，我感到沮丧。',
    dimension: 'anxiety',
    reverse: false,
    order: 35
  },

  // 回避依恋维度题目 (偶数题目)
  {
    id: 2,
    text: '我发现很难依赖恋人。',
    dimension: 'avoidance',
    reverse: false,
    order: 2
  },
  {
    id: 4,
    text: '我发现恋人不愿意像我希望的那样亲近我。',
    dimension: 'avoidance',
    reverse: false,
    order: 4
  },
  {
    id: 6,
    text: '我感到与恋人亲近很舒服。',
    dimension: 'avoidance',
    reverse: true,
    order: 6
  },
  {
    id: 8,
    text: '我发现很难允许自己依赖恋人。',
    dimension: 'avoidance',
    reverse: false,
    order: 8
  },
  {
    id: 10,
    text: '我不喜欢向恋人表露我内心深处的感受。',
    dimension: 'avoidance',
    reverse: false,
    order: 10
  },
  {
    id: 12,
    text: '我发现很难完全信任恋人。',
    dimension: 'avoidance',
    reverse: false,
    order: 12
  },
  {
    id: 14,
    text: '恋人想要我更加亲近，但我感到不舒服。',
    dimension: 'avoidance',
    reverse: false,
    order: 14
  },
  {
    id: 16,
    text: '我告诉恋人几乎所有事情。',
    dimension: 'avoidance',
    reverse: true,
    order: 16
  },
  {
    id: 18,
    text: '我发现很难依赖恋人。',
    dimension: 'avoidance',
    reverse: false,
    order: 18
  },
  {
    id: 20,
    text: '我不介意向恋人寻求安慰、建议或帮助。',
    dimension: 'avoidance',
    reverse: true,
    order: 20
  },
  {
    id: 22,
    text: '我发现很难依赖恋人。',
    dimension: 'avoidance',
    reverse: false,
    order: 22
  },
  {
    id: 24,
    text: '我不喜欢向恋人敞开心扉。',
    dimension: 'avoidance',
    reverse: false,
    order: 24
  },
  {
    id: 26,
    text: '我更愿意不表露我对恋人的感受。',
    dimension: 'avoidance',
    reverse: false,
    order: 26
  },
  {
    id: 28,
    text: '我发现很容易依赖恋人。',
    dimension: 'avoidance',
    reverse: true,
    order: 28
  },
  {
    id: 30,
    text: '我不喜欢感觉与恋人很亲近。',
    dimension: 'avoidance',
    reverse: false,
    order: 30
  },
  {
    id: 32,
    text: '我发现很容易亲近恋人。',
    dimension: 'avoidance',
    reverse: true,
    order: 32
  },
  {
    id: 34,
    text: '与恋人亲近让我感到不舒服。',
    dimension: 'avoidance',
    reverse: false,
    order: 34
  },
  {
    id: 36,
    text: '我发现很难让恋人依赖我。',
    dimension: 'avoidance',
    reverse: false,
    order: 36
  }
];

// 按顺序排序题目
const ORDERED_QUESTIONS = ECR_QUESTIONS.sort((a, b) => a.order - b.order);

// 焦虑依恋题目ID列表 (1-36中的奇数)
const ANXIETY_QUESTION_IDS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];

// 回避依恋题目ID列表 (1-36中的偶数)
const AVOIDANCE_QUESTION_IDS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];

// 需要反向计分的题目ID列表
const REVERSE_SCORED_IDS = [6, 9, 15, 19, 22, 25, 27, 30, 31, 33, 36];

// 量表信息
const SCALE_INFO = {
  name: 'ECR-R',
  fullName: 'Experiences in Close Relationships-Revised',
  version: '2000',
  authors: ['Fraley, R. C.', 'Waller, N. G.', 'Brennan, K. A.'],
  totalQuestions: 36,
  dimensions: ['anxiety', 'avoidance'],
  scaleRange: [1, 7],
  description: '亲密关系经历量表修订版，用于评估成人依恋中的焦虑和回避维度'
};

// 量表选项标签 (7点李克特量表)
const SCALE_LABELS = {
  1: '非常不同意',
  2: '不同意',
  3: '有点不同意',
  4: '中立/不确定',
  5: '有点同意',
  6: '同意',
  7: '非常同意'
};

// 题目维度映射
const QUESTION_DIMENSION_MAP = {
  1: 'anxiety', 2: 'avoidance', 3: 'anxiety', 4: 'avoidance', 5: 'anxiety', 6: 'avoidance',
  7: 'anxiety', 8: 'avoidance', 9: 'anxiety', 10: 'avoidance', 11: 'anxiety', 12: 'avoidance',
  13: 'anxiety', 14: 'avoidance', 15: 'anxiety', 16: 'avoidance', 17: 'anxiety', 18: 'avoidance',
  19: 'anxiety', 20: 'avoidance', 21: 'anxiety', 22: 'avoidance', 23: 'anxiety', 24: 'avoidance',
  25: 'anxiety', 26: 'avoidance', 27: 'anxiety', 28: 'avoidance', 29: 'anxiety', 30: 'avoidance',
  31: 'anxiety', 32: 'avoidance', 33: 'anxiety', 34: 'avoidance', 35: 'anxiety', 36: 'avoidance'
};

// 导出
module.exports = {
  // 题目数据
  ECR_QUESTIONS,
  ORDERED_QUESTIONS,

  // 题目ID列表
  ANXIETY_QUESTION_IDS,
  AVOIDANCE_QUESTION_IDS,
  REVERSE_SCORED_IDS,

  // 量表信息
  SCALE_INFO,
  SCALE_LABELS,
  QUESTION_DIMENSION_MAP,

  // 工具函数
  getQuestionById(id) {
    return ECR_QUESTIONS.find(q => q.id === id) || null;
  },

  getQuestionsByDimension(dimension) {
    return ECR_QUESTIONS.filter(q => q.dimension === dimension);
  },

  getOrderedQuestions() {
    return ORDERED_QUESTIONS;
  },

  getTotalQuestions() {
    return 36;
  },

  isReverseScored(questionId) {
    return REVERSE_SCORED_IDS.includes(questionId);
  },

  getDimension(questionId) {
    return QUESTION_DIMENSION_MAP[questionId] || null;
  },

  getScaleLabel(value) {
    return SCALE_LABELS[value] || '未知';
  },

  validateResponse(response) {
    return response >= 1 && response <= 7;
  },

  // 计算反向计分
  calculateScore(questionId, response) {
    if (response === null || response === undefined) {
      return null;
    }

    if (this.isReverseScored(questionId)) {
      return 8 - response; // 反向计分
    }

    return response;
  }
};