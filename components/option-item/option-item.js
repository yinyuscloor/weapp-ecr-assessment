// 选项按钮组件
Component({
  // 组件属性
  properties: {
    // 选项值 (1-7)
    value: {
      type: Number,
      value: 1
    },
    // 选项标签
    label: {
      type: String,
      value: '非常不同意'
    },
    // 是否选中
    isSelected: {
      type: Boolean,
      value: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    }
  },

  // 组件数据
  data: {
    // 组件内部数据
  },

  // 组件方法
  methods: {
    // 选择选项
    onSelect(e) {
      if (this.data.disabled) {
        return;
      }

      const { value } = e.currentTarget.dataset;

      // 触发选择事件
      this.triggerEvent('select', {
        value: value
      }, {
        bubbles: true,
        composed: true
      });

      console.log('选项被选择:', value);
    }
  },

  // 组件生命周期
  lifetimes: {
    attached() {
      // 组件被附加到页面时
      console.log('选项按钮组件被附加，值:', this.data.value);
    },
    detached() {
      // 组件从页面移除时
      console.log('选项按钮组件被移除');
    }
  }
});