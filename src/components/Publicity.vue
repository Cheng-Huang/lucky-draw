<template>
  <div class="c-Publicity">
    <el-carousel
      height="48px"
      :autoplay="true"
      indicator-position="none"
      arrow="never"
      :interval="3000"
    >
      <el-carousel-item v-for="item in message" :key="item.key">
        <div class="item" :class="{ actiname: item.key === 0 }">
          <span v-if="item.title" class="title"> {{ item.title }}</span>
          <span v-if="item.value" class="value">
            {{ item.value }}
          </span>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
import { conversionCategoryName } from '@/helper/index';

export default {
  name: 'Publicity',
  computed: {
    config() {
      return this.$store.state.config;
    },
    result() {
      return this.$store.state.result;
    },
    list() {
      return this.$store.state.list;
    },
    message() {
      const { result, config } = this;
      const fields = Object.keys(config);

      let message = [{ key: 0, title: config.name }];
      fields.forEach((item, index) => {
        let label = conversionCategoryName(item);
        if (result[item] && config[item] > 0) {
          const names = (result[item] || []).map(id => this.getWinnerName(id));
          message.push({
            key: index + 1,
            title: `${label}抽奖结果:`,
            value: `${names.length > 0 ? names.join('、') : '暂未抽取'}`
          });
        }
      });

      return message;
    }
  },
  methods: {
    getWinnerName(id) {
      const key = Number(id);
      const item = (this.list || []).find(d => d.key === key);
      return item && item.name ? item.name : String(id);
    }
  }
};
</script>
<style lang="scss">
.c-Publicity {
  height: 100%;
  background: transparent;
  /* Left side fade to avoid cutting the floating logo */
  --banner-left-fade-0: 120px;
  --banner-left-fade-1: 220px;
  --banner-left-fade-2: 340px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.06) 35%,
      rgba(255, 255, 255, 0.06) 82%,
      rgba(255, 255, 255, 0) 100%
    );
    backdrop-filter: blur(14px) saturate(160%);
    -webkit-backdrop-filter: blur(14px) saturate(160%);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    /* Smoothly fade-in from the left so the glass base won't "cut" the logo */
    -webkit-mask-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) var(--banner-left-fade-0),
      rgba(0, 0, 0, 0.25) var(--banner-left-fade-1),
      rgba(0, 0, 0, 1) var(--banner-left-fade-2),
      #000 100%
    );
    mask-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) var(--banner-left-fade-0),
      rgba(0, 0, 0, 0.25) var(--banner-left-fade-1),
      rgba(0, 0, 0, 1) var(--banner-left-fade-2),
      #000 100%
    );
    pointer-events: none;
  }
  .el-carousel {
    position: relative;
    z-index: 1;
    width: 100%;
    margin: 0 auto;
  }
  .item {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #fff;
    font-size: 16px;
    box-sizing: border-box;
    padding: 0 200px;
    .title {
      color: rgba(255, 255, 255, 0.88);
    }
    .value {
      margin-left: 10px;
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &.actiname {
      .title {
        color: #fff;
        font-weight: 900;
        font-size: clamp(18px, 2.4vw, 26px);
        letter-spacing: 0.04em;
      }
    }
  }
  @media (max-width: 1200px) {
    .item {
      padding: 0 160px;
    }
  }
  @media (max-width: 900px) {
    .item {
      padding: 0 120px;
    }
  }
}
</style>
