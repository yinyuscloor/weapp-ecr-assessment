// 进度条组件
Component({
  // 组件属性
  properties: {
    // 当前进度
    current: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.updatePercentage();
      }
    },
    // 总进度
    total: {
      type: Number,
      value: 100,
      observer(newVal) {
        this.updatePercentage();
      }
    },
    // 标签文本
    label: {
      type: String,
      value: ''
    }
  },

  // 组件数据
  data: {
    // 计算出的百分比
    percentage: 0
  },

  // 组件方法
  methods: {
    // 更新百分比
    updatePercentage() {
      const { current, total } = this.data;

      if (total <= 0) {
        this.setData({ percentage: 0 });
        return;
      }

      // 计算百分比
      let percentage = Math.round((current / total) * 100);
      percentage = Math.min(Math.max(percentage, 0), 100); // 限制在0-100之间

      this.setData({ percentage });

      // 触发进度更新事件
      this.triggerEvent('progressupdate', {
        current: current,
        total: total,
        percentage: percentage
      }, {
        bubbles: true,
        composed: true
      });

      console.log('进度更新:', current, '/', total, '=', percentage + '%');
    },

    // 设置进度
    setProgress(current, total) {
      this.setData({
        current: current,
        total: total || this.data.total
      });
    },

    // 增加进度
    increment(amount = 1) {
      const newCurrent = this.data.current + amount;
      this.setData({ current: newCurrent });
    },

    // 减少进度
    decrement(amount = 1) {
      const newCurrent = Math.max(0, this.data.current - amount);
      this.setData({ current: newCurrent });
    }
  },

  // 组件生命周期
  lifetimes: {
    attached() {
      // 组件被附加到页面时
      console.log('进度条组件被附加');
      this.updatePercentage();
    },
    ready() {
      // 组件渲染完成时
      console.log('进度条组件准备就绪');
    },
    detached() {
      // 组件从页面移除时
      console.log('进度条组件被移除');
    }
  }
});