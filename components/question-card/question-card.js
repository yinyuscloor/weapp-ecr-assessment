// 题目卡片组件
Component({
  // 组件属性
  properties: {
    // 题目编号
    questionNumber: {
      type: String,
      value: 'Q1'
    },
    // 题目维度
    questionDimension: {
      type: String,
      value: '焦虑维度'
    },
    // 题目文本
    questionText: {
      type: String,
      value: ''
    },
    // 动画类
    animationClass: {
      type: String,
      value: 'fade-in'
    }
  },

  // 组件数据
  data: {
    // 组件内部数据
  },

  // 组件方法
  methods: {
    // 组件内部方法
  },

  // 组件生命周期
  lifetimes: {
    attached() {
      // 组件被附加到页面时
      console.log('题目卡片组件被附加');
    },
    detached() {
      // 组件从页面移除时
      console.log('题目卡片组件被移除');
    }
  }
});