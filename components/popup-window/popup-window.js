// 自定义模态框组件
Component({
  // 组件属性
  properties: {
    // 是否显示模态框
    show: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal) {
          // 显示时触发显示动画
          this.setData({
            visible: true,
            animateIn: true
          });
        } else {
          // 隐藏时触发隐藏动画
          this.setData({ animateIn: false });
          // 动画结束后隐藏
          setTimeout(() => {
            this.setData({ visible: false });
          }, 300);
        }
      }
    },
    // 标题
    title: {
      type: String,
      value: '提示'
    },
    // 内容
    content: {
      type: String,
      value: ''
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      value: '确定'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      value: '取消'
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      value: true
    },
    // 确认按钮颜色
    confirmColor: {
      type: String,
      value: '#a1887f' // 主色
    },
    // 取消按钮颜色
    cancelColor: {
      type: String,
      value: '#666666' // 灰色
    },
    // 是否显示遮罩层
    showOverlay: {
      type: Boolean,
      value: true
    },
    // 点击遮罩层是否可关闭
    closeOnClickOverlay: {
      type: Boolean,
      value: true
    }
  },

  // 组件数据
  data: {
    // 组件内部状态
    visible: false,
    animateIn: false
  },

  // 组件方法
  methods: {
    // 确认按钮点击事件
    onConfirm() {
      this.triggerEvent('confirm');
      // 自动关闭模态框
      this.closeModal();
    },

    // 取消按钮点击事件
    onCancel() {
      this.triggerEvent('cancel');
      // 自动关闭模态框
      this.closeModal();
    },

    // 点击遮罩层
    onOverlayTap() {
      if (this.data.closeOnClickOverlay) {
        this.triggerEvent('overlaytap');
        this.closeModal();
      }
    },

    // 关闭模态框
    closeModal() {
      this.setData({ show: false });
    },

    // 阻止事件冒泡
    catchTap(e) {
      // 阻止事件继续传播
      return;
    }
  },

  // 组件生命周期
  lifetimes: {
    attached() {
      console.log('模态框组件被附加');
    },
    detached() {
      console.log('模态框组件被移除');
    }
  }
});